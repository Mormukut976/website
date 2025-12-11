const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    countryCode: { type: String, default: '+91' },
    passwordHash: { type: String, required: true },
    nickname: { type: String },
    inviteCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vipLevel: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    // optional payout account settings
    withdrawMethod: { type: String, default: 'UPI' },
    withdrawUpiId: { type: String },
    withdrawName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
