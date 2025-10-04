import mongoose from "mongoose";

const Queue_offersSchema = new mongoose.Schema({
  lot: {
    type: Number,
    required: true
  },
  processing: {
    type: Boolean,
    default: false,
    required: true
  },
  errorMessage: {
    type: Object,
    default: {}
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('QueueOffer', Queue_offersSchema, 'queue_offers');