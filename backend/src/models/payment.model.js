const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderCode: {
    type: Number,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  returnUrl: {
    type: String,
    required: true,
  },
  cancelUrl: {
    type: String,
    required: true,
  },
  checkoutUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
  },
  userId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotarizationService',
  },
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotarizationField',
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
