const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const requestSessionSignatureSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    approvalStatus: {
      notary: {
        approved: { type: Boolean, default: false },
        approvedAt: { type: Date, default: null },
      },
      users: [
        {
          email: { type: String },
          approved: { type: Boolean, default: false },
          approvedAt: { type: Date, default: null },
          signatureImage: { type: String, default: null },
        },
      ],
      creator: {
        approved: { type: Boolean, default: false },
        approvedAt: { type: Date, default: null },
        signatureImage: { type: String, default: null },
      },
    },
  },
  {
    timestamps: true,
    collection: 'requestSessionSignature',
  }
);
requestSessionSignatureSchema.plugin(toJSON);
requestSessionSignatureSchema.plugin(paginate);

module.exports = mongoose.model('RequestSessionSignature', requestSessionSignatureSchema);
