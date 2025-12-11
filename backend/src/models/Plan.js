const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // e.g. VIP1
    description: { type: String },
    unitPrice: { type: Number, required: true }, // amount user pays
    dailyEarnings: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
    minVipLevel: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
