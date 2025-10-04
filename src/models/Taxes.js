import Mongoose from 'mongoose';

const TaxesSchema = new Mongoose.Schema({
  icms: {
    default: Number,
    originGO: Number,
    sorgo: Number,
  },
  pisCofins: Number,
  finance: Number,
  icmsFrete: {
    in: Number,
    out: Number,
  },
  funrural: {
    isTaxPaidOnRevenue: Number,
    isTaxNotPaidOnRevenue: Number,
  },
  fundeinfra: {
    milho: Number,
    soja: Number,
  },
});

export default Mongoose.model('Taxes', TaxesSchema);
