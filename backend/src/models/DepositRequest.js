const mongoose = require('mongoose');

const depositRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    upiId: { type: String },
    txnId: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    handledAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('DepositRequest', depositRequestSchema);
