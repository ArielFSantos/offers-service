import Mongoose from 'mongoose';

const DistanceSchema = new Mongoose.Schema(
  {
    from: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    fromUser: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fromUserSimulated: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'PreUser',
    },
    fromUserName: { type: String },
    inKm: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    to: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    toUser: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    toUserSimulated: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'PreUser',
    },
    toUserName: { type: String },
    routeGeoJSON: { type: Object },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('Distance', DistanceSchema);
