const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userWalletSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nftItems: [
      {
        transactionHash: {
          type: String,
          required: true,
          trim: true,
          unique: true,
        },
        filename: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 1,
        },
        tokenId: {
          type: String,
          required: true,
          trim: true,
        },
        tokenURI: {
          type: String,
          required: true,
          trim: true,
        },
        contractAddress: {
          type: String,
          required: true,
          trim: true,
        },
        mintedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userWalletSchema.plugin(toJSON);
userWalletSchema.plugin(paginate);

const UserWallet = mongoose.model('UserWallet', userWalletSchema);

module.exports = UserWallet;
