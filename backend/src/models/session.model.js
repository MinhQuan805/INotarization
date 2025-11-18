const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
  },
  notaryField: {
    type: Object,
    required: true,
  },
  notaryService: {
    type: Object,
    required: true,
  },
  sessionName: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  users: {
    type: [
      {
        email: { type: String, required: true },
        status: { type: String, default: 'pending' }, // 'pending', 'accepted', 'rejected'
      },
    ],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  files: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        filename: {
          type: String,
          required: false,
          trim: true,
        },
        firebaseUrl: {
          type: String,
          required: false,
          trim: true,
        },
        createdAt: {
          type: Date,
          required: false,
        },
      },
    ],
    default: [],
  },
  output: [
    {
      filename: {
        type: String,
        required: true,
        trim: true,
      },
      firebaseUrl: {
        type: String,
        required: true,
        trim: true,
      },
      transactionHash: {
        type: String,
        required: false,
        default: null,
      },
      uploadedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
});

sessionSchema.plugin(toJSON);
sessionSchema.plugin(paginate);

module.exports = mongoose.model('Session', sessionSchema);
