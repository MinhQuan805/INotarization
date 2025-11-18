const mongoose = require('mongoose');

const SessionStatusTrackingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
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
  },
  { collection: 'sessionStatusTrackings' }
);

module.exports = mongoose.model('SessionStatusTracking', SessionStatusTrackingSchema);
