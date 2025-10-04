import Mongoose from 'mongoose';

const GrainSchema = new Mongoose.Schema(
  {
    code: {
      type: Number,
      min: 1,
      required: true,
      unique: true,
    },
    type: String,
    image: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('Grain', GrainSchema);
