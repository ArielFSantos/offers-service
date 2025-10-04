import Mongoose from 'mongoose';
import PointSchema from './PointSchema.js';

const AddressSchema = new Mongoose.Schema(
  {
    addressNote: String,
    addressRoute: String,
    best: { type: Mongoose.Schema.Types.ObjectId, ref: 'BestOffers' },
    city: { type: Mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    dirtRoadKm: { type: Number, min: 0, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isBuyAddress: { type: Boolean, required: true },
    isTaxPaidOnRevenue: Boolean,
    location: { type: PointSchema, index: '2dsphere', required: true },
    mapsLink: { type: String, required: true },
    farmLocation: { type: PointSchema, index: '2dsphere' },
    farmMapsLink: { type: String },
    name: { type: String, required: true },
    cep: {type: String},
    productionAreaInHa: { type: Number },
    productionAreaMilho: { type: Number },
    productionAreaSorgo: { type: Number },
    productionAreaSoja: { type: Number },
    user: { type: Mongoose.Schema.Types.ObjectId, ref: 'User' },
    simulated: Boolean,
    isToExport: Boolean,
    type: String,
    isRoyaltParticipant: Boolean,
    isDeleted: Boolean,
    error: Boolean,
    processing: Boolean,
    isWarehouse: Boolean,
    isExportPoint: Boolean,
    isTeste: Boolean,
    isGranja: Boolean,
    isHumanFoodIndustry: Boolean,
    isAnimalFoodIndustry: Boolean,
    isUsina: Boolean,
    isConfinamento: Boolean,
    isExportacao: Boolean,
    isPisCofins: Boolean,
    storageCost: Number,
    receptionCost: Number,
    harvestCapacity: Number,
    receivingCapacity: Number,
    techBreak: Number,
  },
  {
    timestamps: true,
  }
);


export default Mongoose.model('Address', AddressSchema);
