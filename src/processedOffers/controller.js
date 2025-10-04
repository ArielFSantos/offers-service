import ProcessedOffer from '../models/ProcessedOffer.js';
import Address from '../models/Address.js';
import Offer from '../models/Offer.js';
import Distance from '../models/Distance.js';
import processPrice from './functions/processPrice.js';
import getParameters from './functions/getParameters.js';
import Queue_offer from '../models/Queue_offersSchem.js';
import HttpError from '../models/HttpError.js';
import calculateDistance from './functions/calculateDistance.js';
import Axios from 'axios';

class ProcessedOffersRPAController {
  async processOffers(req, res, next) {
    let queueId;
    let offersQueue;
    try {
      // Atualiza os ultimos 10
      offersQueue = await Queue_offer.find({ processing: false })
        .sort({ lot: 1, createdAt: 1 })
        .populate({
          path: 'offer',
          populate: {
            path: 'address',
            select: '_id location',
          }
        })
        .limit(10)
        .lean();

      if (!offersQueue.length) {
        await Axios.get('https://api.foxdc.com.br/api/rpa/offers/create-queue/all');
        return res.json({
          status: 'OK',
          message: 'Nenhuma oferta na fila para processamento',
        });
      }

      await Queue_offer.updateMany(
        { _id: { $in: offersQueue.map(o => o._id) } },
        { $set: { processing: true } }
      );


      res.json({
        status: 'OK',
        message: 'Processamento de 5 ofertas iniciado com sucesso',
      });

      for (const queueEntry of offersQueue) {

        if (!queueEntry || !queueEntry.offer) {
          throw new Error("Nenhuma oferta válida na fila");
        }

        const existOffer = await Offer.findById(queueEntry.offer._id).lean();

        if (!existOffer) {
          throw new Error("Oferta da fila não existe mais");
        }

        queueId = queueEntry._id;
        const { offer } = queueEntry;
        const { isBuying } = offer;
        const distanceMap = new Map();
        const calculateDistanceMap = new Map();

        // Filtrando endereços e parâmetros para o processamento
        const [addresses, { taxParams, parameters, freights, freightPercentage }, distances] = await Promise.all([
         await Address.aggregate([
            {
              $match: {
                isBuyAddress: !isBuying,
                isDeleted: { $ne: true }
              }
            },
            {
              $lookup: {
                from: 'cities',          
                localField: 'city',
                foreignField: '_id',
                as: 'city'
              }
            },
            { $unwind: '$city' },      
            { $match: { 'city.uf': 'GO' } }
          ]),
          getParameters(),
          Distance.find({
            $or: [
              { to: offer.address._id },
              { from: offer.address._id }
            ]
          })
            .populate({
              path: 'to from',
              populate: 'city',
            }).then((distances) => {
              for (const d of distances) {
                if (d.to?._id && d.from?._id) {
                  const key = `${d.from._id.toString()}_${d.to._id.toString()}`;
                  distanceMap.set(key, d);
                }
              }
            }),
        ]);

        const processedOffers = [];

        for (const address of addresses) {
          const from = !isBuying ? offer.address : address;
          const to = isBuying ? offer.address : address;

          if (!(to && to._id) || !(from && from._id)) {
            continue;
          }

          let key = `${from._id.toString()}_${to._id.toString()}`;
          let distance = distanceMap.get(key);

          if (!distance) {
            key = `${to._id.toString()}_${from._id.toString()}`;
            distance = distanceMap.get(key);
          }

          if (!distance) {
            let key = `${from._id.toString()}_${to._id.toString()}`;
            calculateDistanceMap.set(key, { to, from });
            continue;
          }


          const processedOffer = processPrice(distance, offer, taxParams, parameters, freights, freightPercentage);

          // Operação em lote para ProcessedOffer
         processedOffers.push({
            updateOne: {
              filter: { offer: offer._id, from: from._id, to: to._id },
              update: {
                $set: {
                  ...processedOffer,
                  isActive: true,
                  updatedAt: new Date()
                },
                $setOnInsert: {
                  offer: offer._id,
                  from: from._id,
                  to: to._id,
                  createdAt: new Date()
                }
              },
              upsert: true
            }
          });
        }

        if (processedOffers.length > 0) {

          await ProcessedOffer.updateMany(
            { offer: offer._id },
            { $set: { isActive: false } }
          );
          await ProcessedOffer.bulkWrite(processedOffers,{ ordered: false });
          await Offer.findByIdAndUpdate(offer._id, {
            $set: {
              processedData: await ProcessedOffer.find({ offer: offer._id, isActive: true }).select('_id').lean().then((processedData) => processedData.map((item) => item._id))
            }
          });
        }

        if (calculateDistanceMap.size > 0) {

          for (const { from, to } of calculateDistanceMap.values()) {
            await calculateDistance(from, to);
          }

          // Se tiver distancias a calcular, joga pro final da fila para processar novamente com nova distancias.
          const lastQueue = await Queue_offer.findOne({ processing: false }).select('lot').sort({ lot: -1 }).lean();
          let lotNumber = lastQueue ? lastQueue.lot : 0;
          await Queue_offer.updateOne(
            { _id: queueId },
            { $set: { processing: false, lot: lotNumber + 1 } }
          );
        }
      }
    } catch (error) {
      await Queue_offer.updateMany(
        { _id: { $in: offersQueue.map(o => o._id) } },
        { $set: { processing: false } }
      );

      await Queue_offer.updateOne(
        { _id: queueId },
        { $set: { errorMessage: { message: `Erro: ${error} durante o processamento da fila: ${queueId} `, timestamp: new Date() }, processing: true } }
      );

      return;
    }
  }

  async createAllOffersQueue(req, res, next) {
    try {
      const [offers, lastQueue] = await Promise.all([
        Offer.find({
          isCanceled: false,
          isDone: false,
          expiresIn: { $gt: new Date() },
        }).select('_id').lean(),

        Queue_offer.findOne({ processing: false }).select('lot').sort({ lot: -1 }).lean(),

        Offer.updateMany({ isCanceled: false, isDone: false, expiresIn: { $lt: new Date() } }, { $set: { isDone: true, isCanceled: true } }),
      ])

      if (!offers.length) {
        return res.json({
          status: 'OK',
          message: 'Nenhuma oferta para processar',
        });
      }

      let lotNumber = lastQueue ? lastQueue.lot : 0;

      // Preparar operações em lote
      const bulkOperations = offers.map(offer => {
        lotNumber++;
        return {
          updateOne: {
            filter: { offer: offer._id },
            update: {
              $set: {
                lot: lotNumber,
                processing: false,
                errorMessage: {},
                offer: offer._id,
              },
            },
            upsert: true,
          }
        }
      });

      // Executar o bulkWrite
      if (bulkOperations.length > 0) {
        await Queue_offer.bulkWrite(bulkOperations);
        return res.json({
          status: 'OK',
          message: `Filas criadas para ${bulkOperations.length} ofertas válidas`,
        });
      } else {
        return res.json({
          status: 'OK',
          message: 'Nenhuma oferta válida encontrada para criar filas.',
        });
      }

    } catch (err) {
      return next(new HttpError(500, err.message));
    }
  }

  async createOfferQueue(req, res, next) {
    try {
      const { id } = req.params;

      const [offer, lastQueue] = await Promise.all([
        Offer.findById(id).select('_id').lean(),
        Queue_offer.findOne({ processing: false }).select('lot').sort({ lot: -1 }).lean(),
        Offer.updateMany({ isCanceled: false, isDone: false, expiresIn: { $lt: new Date() } }, { $set: { isDone: true, isCanceled: true } }),
      ]);

      if (!offer) {
        return res.json({
          status: 'ERROR',
          message: 'Oferta não encontrada',
        });
      }

      let lotNumber = lastQueue ? lastQueue.lot : 0;

      await Queue_offer.updateOne(
        { offer: offer._id },
        {
          $set: {
            lot: lotNumber + 1,
            processing: false,
            errorMessage: {},
            offer: offer._id,
          },
        },
        { upsert: true }
      );

      return res.json({
        status: 'OK',
        message: 'Fila criada com sucesso',
      });
    } catch (err) {
      return next(new HttpError(500, err.message));
    }
  }

  async processOffersForOneAddress(req, res, next) {
    try {
      const { id } = req.params;

      const address = await Address.findById(id).lean();
      const { isBuyAddress } = address;
      const distanceMap = new Map();
      const calculateDistanceMap = new Map();

      const [offers, _, { taxParams, parameters, freights, freightPercentage }] = await Promise.all([
        Offer.find({
          isCanceled: false,
          isDone: false,
          expiresIn: { $gt: new Date() },
          isBuying: !isBuyAddress,
          address: { $ne: null }
        }).populate('address').lean(),
        Distance.find({
          [isBuyAddress ? 'to' : 'from']: id,
        })
          .populate({
            path: 'to from toUser fromUser',
            populate: 'city',
          }).then((distances) => {
            for (const d of distances) {
              if (d.to?._id && d.from?._id) {
                const key = `${d.from._id.toString()}_${d.to._id.toString()}`;
                distanceMap.set(key, d);
              }
            }
          }),
        getParameters(),
      ]);

      if (!address) {
        return res.json({
          status: 'ERROR',
          message: 'Endereço não encontrado',
        });
      }

      const processedOffers = [];
      let currentProcessDataIds = [];
      const bulkOperationsOffers = [];


      for (const offer of offers) {
        const to = !isBuyAddress ? offer.address : address;
        const from = isBuyAddress ? offer.address : address;
        currentProcessDataIds = []
        if (!offer.address?._id) {
          continue;
        }
        const distance = distanceMap.get(`${id}_${offer?.address?._id}`);
        if (!distance) {
          calculateDistanceMap.set(key, { to, from });
          continue;
        }

        const processedOffer = new ProcessedOffer(processPrice(distance, offer, taxParams, parameters, freights, freightPercentage));

        processedOffers.push({
          updateOne: {
            filter: { offer: offer._id, to: to._id, from: from._id },
            update: {
              $set: processedOffer._doc,
              $setOnInsert: {
                ...processedOffer._doc,
                offer: offer._id,
                to: to._id,
                from: from._id,
              }
            },
          },
        });

        bulkOperationsOffers.push({
          updateOne: {
            filter: { _id: offer._id },
            update: {
              $push: {
                processedData: processedOffer._id
              },
            },
          },
        })
      }


      if (processedOffers.length > 0) {
        await ProcessedOffer.bulkWrite(processedOffers);
        await Offer.bulkWrite(bulkOperationsOffers);
        await Axios.get(`https://api.foxdc.com.br/api/rpa/best-offers/create-queue/one/${id}`);
      }

      process.nextTick(async () => {
        for (const { from, to } of calculateDistanceMap.values()) {
          await calculateDistance(from, to);
        }
      })

      return res.json({
        status: 'OK',
        message: 'Processamento de ofertas para um único endereço concluído com sucesso',
      });


    } catch (err) {
      return next(new HttpError(500, err.message));
    }
  }

}

export default new ProcessedOffersRPAController();
