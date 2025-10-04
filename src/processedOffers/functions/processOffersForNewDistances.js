import Offer from "../../../app/models/Offer.js";
import Distance from "../../../app/models/Distance.js";
import ProcessedOffer from "../../../app/models/ProcessedOffer.js";
import getParameters from "./getParameters";
import Address from "../../models/Address.js";
import processPrice from "./processPrice";


export default async function processOffersForNewDistances(addressesIds) {
  try {
    const distanceMap = new Map();

    const [offers, _, { taxParams, parameters, freights, freightPercentage }, addresses] = await Promise.all([
      Offer.find({
        isCanceled: false,
        isDone: false,
        expiresIn: { $gt: new Date() },
        address: { $ne: null }
      }).populate('address').lean(),
      Distance.find({
        $or: [
          { to: { $in: addressesIds } },
          { from: { $in: addressesIds } },
        ]
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
      Address.find({
        _id: { $in: addressesIds },
      }),
    ]);

    const processedOffers = [];
    const bulkOperationsOffers = [];

    for (const offer of offers) {
      const isBuying = offer.isBuying;
      const offerAddress = offer.address;
      const currentProcessDataIds = [];

      // Para cada endereço
      for (const address of addresses) {
        let to, from;
        if (isBuying && address.isBuyAddress) {
          continue;
        } else if (!isBuying && !address.isBuyAddress) {
          continue;
        }
        to = isBuying ? offerAddress : address;
        from = !isBuying ? offerAddress : address;

        if (!(to && to._id) || !(from && from._id)) {
          continue;
        }

        const key = `${from._id.toString()}_${to._id.toString()}`;
        let distance = distanceMap.get(key);

        if (!distance) {
          continue;
        }

        const processedOffer = new ProcessedOffer(processPrice(distance, offer, taxParams, parameters, freights, freightPercentage));

        processedOffers.push({
          insertOne: {
            document: processedOffer,
          },
        });

        currentProcessDataIds.push(processedOffer._id);
      }

      if (currentProcessDataIds.length > 0) {
        bulkOperationsOffers.push({
          updateOne: {
            filter: { _id: offer._id },
            update: {
              $push: {
                processedData: { $each: currentProcessDataIds },
              },
            },
          },
        });
      }
    }

    if (processedOffers.length > 0) {
      await ProcessedOffer.bulkWrite(processedOffers);
      if (bulkOperationsOffers.length > 0) {
        await Offer.bulkWrite(bulkOperationsOffers);
      }
    }

    return true;

  } catch (err) {
    throw new Error('Error during processed offers creation:', err);
  }
}
