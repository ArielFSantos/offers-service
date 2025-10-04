import Mongoose from 'mongoose';
import Axios from 'axios';

const OfferSchema = new Mongoose.Schema(
  {
    address: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    totalPriceBuyer: { type: Number },
    totalPriceSeller: { type: Number },
    totalPriceFreight: { type: Number },
    freightPrice: { type: Number },
    amount: { type: Number, min: 450, required: true },
    commissionValue: { type: Number },
    amountOrdered: { type: Number, default: 0, min: 0, required: true },
    bagPrice: { type: Number, min: 0, required: true },
    createdBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryDeadline: { type: String, required: true },
    expiresIn: { type: Date, required: true },
    grain: { type: Number, required: true },
    isBuying: { type: Boolean, required: true },
    isCanceled: { type: Boolean, default: false, required: true },
    isDone: { type: Boolean, default: false, required: true },
    processedAt: { type: Date, default: new Date(), required: true },
    processedData: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'ProcessedOffer',
        required: true,
      },
    ],
    stateRegistration: { type: String, required: true },
    transactions: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
      },
    ],
    sign: Object,
    simulated: Boolean,
    paymentDeadLine: String,
    isGanhaGanha: Boolean,
    isFob: Boolean,
    isFobCity: Boolean,
    isFobWarehouse: Boolean,
    available: Boolean,
    foxFee: Number,
    financeTax: Number,
    b3Indexed: Boolean,
    hasOrder: Boolean,
    b3Percentage: Number,
    grainId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Grain',
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user:{
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);


async function createQueue(doc) {
  if (!doc || !doc._id) return;
  try {
    await Axios.get(`https://api.foxdc.com.br/api/rpa/offers/create-queue/one/${doc._id}`);
    console.log(`Fila criada para offer ${doc._id}`);
  } catch (error) {
    console.error('Erro ao criar fila para offer:', doc._id, error.message);
  }
}

OfferSchema.post("save", async function (doc) {
  await createQueue(doc);
});

export default Mongoose.model('Offer', OfferSchema);
