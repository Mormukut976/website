require('dotenv').config();

const { connectDB } = require('../config/db');
const Plan = require('../models/Plan');

async function seed() {
  await connectDB();

  const existing = await Plan.countDocuments();
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log('Plans already exist, skipping seeding');
    process.exit(0);
  }

  const plansData = [
    {
      name: '[V0] Starter',
      code: 'VIP0',
      description: 'Entry level plan',
      unitPrice: 20,
      dailyEarnings: 0.5,
      durationDays: 46,
      totalRevenue: 20 + 0.5 * 46,
      minVipLevel: 0,
    },
    {
      name: '[V1] Jaguar Basic',
      code: 'VIP1',
      description: 'Basic Jaguar investment',
      unitPrice: 290,
      dailyEarnings: 234.9,
      durationDays: 46,
      totalRevenue: 10805.4,
      minVipLevel: 0,
    },
    {
      name: '[V2] Jaguar Pro',
      code: 'VIP2',
      description: 'Higher earnings plan',
      unitPrice: 1990,
      dailyEarnings: 1631.8,
      durationDays: 46,
      totalRevenue: 75062.8,
      minVipLevel: 1,
    },
    {
      name: '[V3] Jaguar Premium',
      code: 'VIP3',
      description: 'Premium high return plan',
      unitPrice: 3990,
      dailyEarnings: 3311.7,
      durationDays: 46,
      totalRevenue: 152338.2,
      minVipLevel: 2,
    },
  ];

  await Plan.insertMany(plansData);
  // eslint-disable-next-line no-console
  console.log('Seeded default plans');
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
