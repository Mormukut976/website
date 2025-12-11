const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    availableBalance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    totalRecharge: { type: Number, default: 0 },
    totalWithdraw: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
