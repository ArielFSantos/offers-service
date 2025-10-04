import Mongoose from 'mongoose';

const PointSchema = new Mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

export default PointSchema;
