import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
    {
        to: {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Address' },
            location: {
                coordinates: { type: [Number], required: true }
            }
        },
        from: {
            _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Address' },
            location: {
                coordinates: { type: [Number], required: true }
            }
        }
    },
    { _id: false }
);

const Queue_distancesSchema = new mongoose.Schema(
    {
        addresses: {
            type: [AddressSchema],
            required: true,
            validate: [arrayLimit, '{PATH} excede o limite de 12 posições']
        },
        processing: { type: Boolean, default: false },
        errorMessages: { type: Object, default: {} },
        lot:{
          type: Number,
          required:true
        }
    },
    { timestamps: true }
);

// funcao para validar as 12 posiçoes
function arrayLimit(val) {
    return val.length <= 12;
}

export default mongoose.model('Queue_distances', Queue_distancesSchema, 'queue_distances');
