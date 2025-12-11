const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

async function applyDailyEarningsForUser(userId) {
  const investments = await Investment.find({ user: userId, status: 'ACTIVE' }).populate('plan');

  if (!investments.length) return;

  const now = new Date();

  for (const investment of investments) {
    const plan = investment.plan;
    if (!plan) continue;

    const startDate = investment.startDate;
    const endDate = investment.endDate;

    const lastCreditBase = investment.lastCreditDate || startDate;

    // No earnings if before or same as last credit
    if (now <= lastCreditBase) continue;

    const totalDaysSinceStart = Math.floor(
      (Math.min(now.getTime(), endDate.getTime()) - startDate.getTime()) / MS_PER_DAY
    );

    const creditedDays = Math.floor(
      ((investment.lastCreditDate || startDate).getTime() - startDate.getTime()) / MS_PER_DAY
    );

    const daysToCredit = totalDaysSinceStart - creditedDays;

    if (daysToCredit <= 0) continue;

    const amountToCredit = daysToCredit * plan.dailyEarnings;

    await Wallet.updateOne(
      { user: userId },
      {
        $inc: { availableBalance: amountToCredit },
      }
    );

    await Transaction.create({
      user: userId,
      type: 'DAILY_EARNING',
      amount: amountToCredit,
      currency: 'INR',
      status: 'SUCCESS',
      meta: { investmentId: investment._id, daysCredited: daysToCredit },
    });

    investment.lastCreditDate = now;

    if (now >= endDate) {
      investment.status = 'COMPLETED';
    }

    // eslint-disable-next-line no-await-in-loop
    await investment.save();
  }
}

module.exports = { applyDailyEarningsForUser };
