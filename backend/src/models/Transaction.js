const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['RECHARGE', 'WITHDRAW_REQUEST', 'WITHDRAW', 'DAILY_EARNING', 'INVEST'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
