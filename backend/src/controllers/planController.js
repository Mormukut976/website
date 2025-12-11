const Plan = require('../models/Plan');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

async function getActivePlans(req, res) {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ minVipLevel: 1, unitPrice: 1 });
    res.json(plans);
  } catch (err) {
    console.error('Get plans error', err);
    res.status(500).json({ message: 'Failed to load plans' });
  }
}

async function getAllPlansAdmin(req, res) {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get all plans admin error', err);
    res.status(500).json({ message: 'Failed to load plans' });
  }
}

async function createPlanAdmin(req, res) {
  try {
    const {
      name,
      code,
      description,
      unitPrice,
      dailyEarnings,
      durationDays,
      totalRevenue,
      minVipLevel,
      isActive,
    } = req.body;

    if (!name || !code || !unitPrice || !dailyEarnings || !durationDays) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const existing = await Plan.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: 'Plan code already exists' });
    }

    const plan = await Plan.create({
      name,
      code,
      description,
      unitPrice,
      dailyEarnings,
      durationDays,
      totalRevenue: totalRevenue || unitPrice + dailyEarnings * durationDays,
      minVipLevel: minVipLevel || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json(plan);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Create plan admin error', err);
    res.status(500).json({ message: 'Failed to create plan' });
  }
}

async function updatePlanAdmin(req, res) {
  try {
    const { id } = req.params;
    const update = req.body;

    if (update.code) {
      const existing = await Plan.findOne({ code: update.code, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Plan code already exists' });
      }
    }

    if (update.unitPrice && update.dailyEarnings && update.durationDays && !update.totalRevenue) {
      update.totalRevenue = update.unitPrice + update.dailyEarnings * update.durationDays;
    }

    const plan = await Plan.findByIdAndUpdate(id, update, { new: true });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Update plan admin error', err);
    res.status(500).json({ message: 'Failed to update plan' });
  }
}

async function seedDefaultPlans(req, res) {
  try {
    const existing = await Plan.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ message: 'Plans already exist' });
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

    const created = await Plan.insertMany(plansData);
    res.status(201).json(created);
  } catch (err) {
    console.error('Seed plans error', err);
    res.status(500).json({ message: 'Failed to seed plans' });
  }
}

async function investInPlan(req, res) {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'planId is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const user = await User.findById(req.userId).select('vipLevel');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const vipLevel = typeof user.vipLevel === 'number' ? user.vipLevel : 0;

    let requiredVipLevel = plan.minVipLevel || 0;

    if (plan.code === 'VIP2') {
      requiredVipLevel = 2;
    } else if (plan.code === 'VIP3') {
      requiredVipLevel = 3;
    }

    if (requiredVipLevel > 0 && vipLevel < requiredVipLevel) {
      let vipMessage = `This plan is only available for VIP ${requiredVipLevel} and above.`;

      if (plan.code === 'VIP2') {
        vipMessage = 'VIP2 plan is only available for VIP2 members. To unlock VIP2, either invest at least ₹2000 in lower plans or pay ₹800 on the Recharge page and ask support to upgrade your VIP level.';
      } else if (plan.code === 'VIP3') {
        vipMessage = 'VIP3 plan is only available for VIP3 members. To unlock VIP3, either invest at least ₹5000 in lower plans or pay ₹3000 on the Recharge page and ask support to upgrade your VIP level.';
      }

      return res.status(403).json({ message: vipMessage });
    }

    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet || wallet.availableBalance < plan.unitPrice) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.availableBalance -= plan.unitPrice;
    wallet.lockedBalance += plan.unitPrice;
    await wallet.save();

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const investment = await Investment.create({
      user: req.userId,
      plan: plan._id,
      amount: plan.unitPrice,
      startDate,
      endDate,
      status: 'ACTIVE',
    });

    await Transaction.create({
      user: req.userId,
      type: 'INVEST',
      amount: plan.unitPrice,
      currency: 'INR',
      status: 'SUCCESS',
      meta: { planId: plan._id },
    });

    res.status(201).json({ investment, wallet });
  } catch (err) {
    console.error('Invest in plan error', err);
    res.status(500).json({ message: 'Failed to invest in plan' });
  }
}

async function getMyInvestments(req, res) {
  try {
    const investments = await Investment.find({ user: req.userId })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (err) {
    console.error('Get my investments error', err);
    res.status(500).json({ message: 'Failed to load investments' });
  }
}

module.exports = {
  getActivePlans,
  seedDefaultPlans,
  investInPlan,
  getMyInvestments,
  getAllPlansAdmin,
  createPlanAdmin,
  updatePlanAdmin,
};
