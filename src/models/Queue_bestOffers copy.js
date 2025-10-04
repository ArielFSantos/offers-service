import mongoose from "mongoose";

const Queue_bestOffersSchema = new mongoose.Schema({
    addresses:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            required: true
        }
    ] ,
    lot: {
        type: Number,
        required: true
    },

    processing: {
        type: Boolean,
        default: false
    },

    errorMessages: {
        type: Object,
        default: {}
    },

    isBuyAddress: {
        type: Boolean,
        required: true
    }

},
{
    timestamps: true,
}
);

export default mongoose.model('Queue_bestOffers', Queue_bestOffersSchema, 'queue_bestoffers');
