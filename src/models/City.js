import Mongoose from 'mongoose';

import states from '../utils/brazilianStates';

const CitySchema = new Mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  uf: {
    type: String,
    enum: states,
    maxlength: 2,
    minlength: 2,
    required: true,
  },
});

export default Mongoose.model('City', CitySchema);
