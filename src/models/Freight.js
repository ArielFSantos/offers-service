import Mongoose from 'mongoose';

const FreightSchema = new Mongoose.Schema(
  {
    kmMin: {
      type: Number,
      min: 0,
      required: true,
    },
    kmMax: {
      type: Number,
      min: 0,
      required: true,
    },
    pricePerKm: {
      type: Number,
      min: 0,
      required: true,
    },
    updatedBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('Freight', FreightSchema);
