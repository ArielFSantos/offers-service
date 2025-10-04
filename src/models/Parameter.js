import Mongoose from 'mongoose';

const ParameterSchema = new Mongoose.Schema(
  {
    createdBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dirtRoadKmPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    expiresInDefault: {
      type: Number,
      min: 0,
      required: true,
    },
    minFreightPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    standardizedCornFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    standardizedSoybeanFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    standardizedSorghumFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    unstandardizedCornFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    unstandardizedSoybeanFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    unstandardizedSorghumFoxFee: {
      type: Number,
      min: 0,
      required: true,
    },
    daysToDeliver: {
      type: Number,
      min: 0,
      required: true,
    },
    interestRatePerMonth: {
      type: Number,
      min: 0,
      required: true,
    },
    version: String,
    bagPriceTarget: String,
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('Parameter', ParameterSchema);
