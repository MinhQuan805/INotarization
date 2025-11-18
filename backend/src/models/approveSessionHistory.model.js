const mongoose = require('mongoose');

const ApproveSessionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Session',
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    beforeStatus: {
      type: String,
      required: true,
    },
    afterStatus: {
      type: String,
      required: true,
    },
  },
  { collection: 'approveSessionHistory' }
);

module.exports = mongoose.model('ApproveSessionHistory', ApproveSessionHistorySchema);
