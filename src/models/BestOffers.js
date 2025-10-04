import Mongoose from 'mongoose';

const BestOffersSchema = new Mongoose.Schema(
  {
    type: String,
    name: String,
    nameAddress: String,
    userPromoter: Boolean,
    nameCity: String,
    nameUf: String,
    idAddress: String,
    simulated: Boolean,
    promotor: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    latitude: Number,
    longitude: Number,
    phone: String,
    offers: [
      {
        bagPrice: Number,
        code: Number,
        deliveryDeadline: String,
        name: String,
        image: String,
        offer: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Offer',
        },
        distance: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Distance',
        },
        transaction: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'ProcessedOffer',
        },
        isGanhaGanha: Boolean,
      },
    ],
    distance: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Distance',
    },
    transaction: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'ProcessedOffer',
    },
    done: Boolean,
    infoProcessing: new Mongoose.Schema({
      totalOffers: Number,
      processedOffers: [
        {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Offers',
        },
      ],
    }),
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('BestOffers', BestOffersSchema);
