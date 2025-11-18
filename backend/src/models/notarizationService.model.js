const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
//const { required } = require('joi');

const notarizationServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NotarizationField',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    required_documents: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { collection: 'notarizationServices' }
);

notarizationServiceSchema.plugin(toJSON);
notarizationServiceSchema.plugin(paginate);

module.exports = mongoose.model('NotarizationService', notarizationServiceSchema);
