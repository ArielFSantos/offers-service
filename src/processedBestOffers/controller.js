import BestOffers from '../models/BestOffers.js';
import Offer from '../models/Offer.js';
import { fetchGrains } from './functions/fetchGrains.js';
import { fetchProcessedOffers } from './functions/fetchProcessedOffers.js';
import { buildBestOffer } from './functions/buildBestOffer.js';
import Queue_bestOffersSchema from '../models/Queue_bestOffers.js';
import HttpError from '../models/HttpError.js';
import getLastQueueLot from './functions/getLastQueue.js';
import Address from '../models/Address.js';
import createQueuesByAddress from './functions/createQueuesByAddress.js';


// Classe do controlador
class ProcessedBestOffersRPAController {
  async processBest(req, res, next) {
    let queueId;

    try {
      
      const queue = await Queue_bestOffersSchema.aggregate([
  // Filtra apenas queues não processadas
  { $match: { processing: false } },

  // Ordena pelo critério desejado
  { $sort: { lot: 1, createdAt: 1, isBuyAddress: -1 } },

  // Pega apenas o primeiro registro (equivalente ao findOne)
  { $limit: 1 },

  // Atualiza o campo 'processing' para true
  {
    $set: { processing: true },
  },

  // Lookup para addresses
  {
    $lookup: {
      from: 'addresses',       // Nome da collection no MongoDB
      localField: 'addresses', // Campo no Queue_bestOffers
      foreignField: '_id',     // Campo no Address
      as: 'addresses',
    },
  },

  // Lookup para city dentro de addresses
  {
    $unwind: { path: '$addresses', preserveNullAndEmptyArrays: true },
  },
  {
    $lookup: {
      from: 'cities',           // Nome da collection de City
      localField: 'addresses.city',
      foreignField: '_id',
      as: 'addresses.city',
    },
  },
  {
    $lookup: {
      from: 'users',           // Nome da collection de User
      localField: 'addresses.user',
      foreignField: '_id',
      as: 'addresses.user',
    },
  },
  {
    $group: {
      _id: '$_id',
      lot: { $first: '$lot' },
      createdAt: { $first: '$createdAt' },
      processing: { $first: '$processing' },
      isBuyAddress: { $first: '$isBuyAddress' },
      addresses: { $push: '$addresses' },
    },
  },
]);

      if (!queue) {
        return res.json({ message: 'Sem lote para ser processado' });
      }

      const { addresses, _id, isBuyAddress } = queue[0];
      queueId = _id;


      const addressIds = addresses.map(address => address._id);
      const [grains, processedOffers] = await Promise.all([
        fetchGrains(),
        fetchProcessedOffers(addressIds, await Offer.find({
          isCanceled: false,
          isDone: false,
          isBuying: !isBuyAddress,
        }).select('_id').lean().then((offers) => offers.map((item) => item._id)), isBuyAddress)
      ]);

      const offersByAddress = processedOffers.reduce((acc, offer) => {
        const addressId = isBuyAddress ? offer.to : offer.from;
        if (!acc[addressId]) acc[addressId] = [];
        acc[addressId].push(offer);
        return acc;
      }, {});

      const bulkOps = addresses.map((address) => {
        const addressSpecificOffers = offersByAddress[address._id] || [];
        const newBest = buildBestOffer(address, grains, addressSpecificOffers, isBuyAddress);

        return {
          updateOne: {
            filter: { latitude: newBest.latitude, longitude: newBest.longitude, name: newBest.name, idAddress: newBest.idAddress.toString() },
            update: {
              $set: {
                offers: newBest.offers,
                done:true,
              }
            },
          },
          upsert: true
        };
      });

     await BestOffers.bulkWrite(bulkOps);

      // Consulta documentos atualiados e salva o id de bestOffers em cada endereco
      const updatedBestOffers = await BestOffers.find({
        idAddress: { $in: addresses.map(a => a._id) }
      });

      for (const bestOffer of updatedBestOffers) {
        await Address.findByIdAndUpdate(bestOffer.idAddress, {
          $set: { best: bestOffer._id }
        });
      }

      return res.status(200).json({ message: 'Melhores ofertas processadas com sucesso!' });

    } catch (err) {
      console.error('Erro ao processar melhores ofertas:', err);

      await Queue_bestOffersSchema.findByIdAndUpdate(queueId, {
        processing: true,
        $set: { errorMessages: err }
      });

      return res.status(500).json({
        message: 'Erro ao processar ofertas',
        error: err.message
      });
    }
  }

  async processBestOneAddress(req, res, next) {
    try {
      const { id } = req.params;

      const address = await Address.findById(id).lean();

      const addressIds = [id];
      const [grains, processedOffers] = await Promise.all([
        fetchGrains(),
        fetchProcessedOffers(addressIds, await Offer.find({
          isCanceled: false,
          isDone: false,
          isBuying: !address.isBuyAddress,
        }).select('_id').lean().then((offers) => offers.map((item) => item._id)), address.isBuyAddress)
      ]);


      const offersByAddress = processedOffers.reduce((acc, offer) => {
        const addressId = address.isBuyAddress ? offer.to : offer.from;
        if (!acc[addressId]) acc[addressId] = [];
        acc[addressId].push(offer);
        return acc;
      }, {});


      const addressSpecificOffers = offersByAddress[address._id] || [];
      const newBest = buildBestOffer(address, grains, addressSpecificOffers, address.isBuyAddress);

      await BestOffers.updateOne({
        idAddress: id,
      }, {
        $set: {
          offers: newBest.offers,
          done: true,
        }
      });

      const bestOffers = await BestOffers.findOne({ idAddress:id }).populate({
        path:'offers',
        populate: 'transaction distance offer'
      }).lean();

      return res.status(200).json({ message: 'Melhores ofertas processadas com sucesso!', data: bestOffers });

    } catch (err) {
        return next(new HttpError(err.message, 500));
    }
  }

  async createQueueAll(req, res, next) {
    try {
      const [lastQueueLot, buyAddresses, sellAddresses] = await Promise.all([
        getLastQueueLot(),
        Address.find({ isBuyAddress: true }).select('_id').lean(),
        Address.find({ isBuyAddress: false }).select('_id').lean(),
      ]);

      // Processar endereços de venda
      await Promise.all([
        createQueuesByAddress(sellAddresses, false, lastQueueLot),
        createQueuesByAddress(buyAddresses, true, lastQueueLot),
        BestOffers.updateMany({}, { $set:{done: false} }),
      ]);

      return res.json({
        status: 'OK',
        message: 'Filas criadas com sucesso para endereços de compra e venda.',
      });

    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
  }

  async createQueueByAddress(req, res, next) {
    const { id } = req.params;

    try {
      const address = await Address.findById(id).lean();

      if (!address) {
        return res.status(404).json({ message: 'Endereço não encontrado' });
      }

      const lastQueueLot = await getLastQueueLot();
      await createQueuesByAddress([address], address.isBuyAddress, lastQueueLot);

      return res.json({
        status: 'OK',
        message: 'Fila criada com sucesso para o endereço.',
      });

    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
  }

}

export default new ProcessedBestOffersRPAController();
