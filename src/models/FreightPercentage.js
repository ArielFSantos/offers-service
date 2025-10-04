import Mongoose from 'mongoose';

const FreightPercentage = new Mongoose.Schema(
  {
    percentage: {
      type: Number,
      min: 0,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('FreightPercentage', FreightPercentage);
