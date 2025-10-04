import HttpError from "../../../app/models/HttpError";
import Queue_bestOffersSchema from "../../../app/models/Queue_bestOffers";

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
