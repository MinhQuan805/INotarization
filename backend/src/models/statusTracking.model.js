const mongoose = require('mongoose');

const StatusTrackingSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  feedback: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('StatusTracking', StatusTrackingSchema);
