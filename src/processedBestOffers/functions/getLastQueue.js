import HttpError from "../../models/HttpError.js";
import Queue_bestOffersSchema from "../../models/Queue_bestOffers.js";

export default async function getLastQueueLot(){
  try {
    let lot = 0;

    const queue = await Queue_bestOffersSchema.findOne(
      { processing: false },
    ).sort({ _id: -1 }).select('lot').lean();

    if(queue){
      lot = queue.lot;
    }

    return lot;

  } catch (err) {
    return next(new HttpError(500, err.message));
  }
}
