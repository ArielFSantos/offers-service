import Mongoose from 'mongoose';

export const definitionProcessdOfferSchema = {
  bagPrice: { type: Number, min: 0, required: true },
  commissionValue: { type: Number },
  offerBagPrice: { type: Number, min: 0, required: true },
  dirtRoadFreightPrice: { type: Number, min: 0, required: true },
  dirtRoadKm: { type: Number, min: 0, required: true },
  dirtRoadKmPrice: { type: Number, min: 0, required: true },
  distance: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Distance',
    required: true,
  },
  foxFee: { type: Number, min: 0, required: true, default: 0 },
  freightPrice: { type: Number, min: 0, required: true },
  freightPricePerKm: { type: Number, min: 0, required: true },
  freightKm: { type: Number, min: 0, required: true },
  fullFreightPrice: { type: Number, min: 0, required: true },
  minFreightPrice: { type: Number, min: 0, required: true },
  offer: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  },
  payableUntil: { type: String, required: true },
  taxes: Object,
  buyerType: String,
  from: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  },
  to: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  },
  fromUser: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  toUser: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fromUserSimulated: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'PreUser',
  },
  toUserSimulated: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'PreUser',
  },
  grain: Number,
  deliveryDeadline: String,
  isGanhaGanha: Boolean,
  isActive: Boolean,
  isFobCity: Boolean,
  amount: Number,
  increasedFreightPrice: { type: Number, min: 0, required: false, default:0 },
};
const ProcessedOfferSchema = new Mongoose.Schema(
  definitionProcessdOfferSchema,
  {
    collection: 'processedOffers',
    timestamps: true,
  }
);

export default Mongoose.model('ProcessedOffer', ProcessedOfferSchema);
