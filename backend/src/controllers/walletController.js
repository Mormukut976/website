const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { applyDailyEarningsForUser } = require('../services/earningsService');

const MIN_WITHDRAW = Number(process.env.MIN_WITHDRAW || 500);

async function getWalletSummary(req, res) {
  try {
    await applyDailyEarningsForUser(req.userId);

    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = await Transaction.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ wallet, transactions });
  } catch (err) {
    console.error('Get wallet summary error', err);
    res.status(500).json({ message: 'Failed to load wallet' });
  }
}

async function getPayoutSettings(req, res) {
  try {
    const user = await User.findById(req.userId).select(
      'withdrawMethod withdrawUpiId withdrawName',
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      withdrawMethod: user.withdrawMethod,
      withdrawUpiId: user.withdrawUpiId,
      withdrawName: user.withdrawName,
    });
  } catch (err) {
    console.error('Get payout settings error', err);
    res.status(500).json({ message: 'Failed to load payout settings' });
  }
}

async function updatePayoutSettings(req, res) {
  try {
    const { withdrawMethod = 'UPI', withdrawUpiId, withdrawName } = req.body;

    if (!withdrawUpiId) {
      return res.status(400).json({ message: 'UPI ID is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { withdrawMethod, withdrawUpiId, withdrawName },
      { new: true },
    ).select('withdrawMethod withdrawUpiId withdrawName');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      withdrawMethod: user.withdrawMethod,
      withdrawUpiId: user.withdrawUpiId,
      withdrawName: user.withdrawName,
    });
  } catch (err) {
    console.error('Update payout settings error', err);
    res.status(500).json({ message: 'Failed to update payout settings' });
  }
}

async function getWithdrawRequests(req, res) {
  try {
    const { status } = req.query;

    const query = { type: 'WITHDRAW_REQUEST' };
    if (status) {
      query.status = status;
    }

    const txs = await Transaction.find(query)
      .populate('user', 'phone nickname withdrawUpiId withdrawName')
      .sort({ createdAt: -1 });

    res.json(txs);
  } catch (err) {
    console.error('Get withdraw requests error', err);
    res.status(500).json({ message: 'Failed to load withdraw requests' });
  }
}

async function approveWithdraw(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid withdraw request id' });
    }

    const tx = await Transaction.findById(id);
    if (!tx || tx.type !== 'WITHDRAW_REQUEST') {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (tx.status !== 'PENDING') {
      return res.status(400).json({ message: 'Withdraw request already processed' });
    }

    tx.status = 'SUCCESS';
    tx.meta = {
      ...(tx.meta || {}),
      adminId: req.userId,
      note: note || 'withdraw_approved',
    };
    await tx.save();

    res.json(tx);
  } catch (err) {
    console.error('Approve withdraw error', err);
    res.status(500).json({
      message: 'Failed to approve withdraw request',
      error: err.message,
    });
  }
}

async function rejectWithdraw(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const tx = await Transaction.findById(id);
    if (!tx || tx.type !== 'WITHDRAW_REQUEST') {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (tx.status !== 'PENDING') {
      return res.status(400).json({ message: 'Withdraw request already processed' });
    }

    const wallet = await Wallet.findOne({ user: tx.user });
    if (wallet) {
      wallet.availableBalance += tx.amount;
      wallet.totalWithdraw -= tx.amount;
      await wallet.save();
    }

    tx.status = 'FAILED';
    tx.meta = {
      ...(tx.meta || {}),
      adminId: req.userId,
      note: note || 'withdraw_rejected',
    };
    await tx.save();

    res.json({ transaction: tx, wallet });
  } catch (err) {
    console.error('Reject withdraw error', err);
    res.status(500).json({ message: 'Failed to reject withdraw request' });
  }
}

async function requestWithdraw(req, res) {
  try {
    const { amount, method, account } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (numericAmount < MIN_WITHDRAW) {
      return res
        .status(400)
        .json({ message: `Minimum withdrawal amount is ₹${MIN_WITHDRAW}` });
    }

    const wallet = await Wallet.findOne({ user: req.userId });
    if (!wallet || wallet.availableBalance < numericAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const user = await User.findById(req.userId);

    const payoutMethod = method || user?.withdrawMethod || 'UPI';
    const payoutAccount = account || user?.withdrawUpiId;

    if (!payoutAccount) {
      return res.status(400).json({ message: 'Please set your withdrawal UPI ID first' });
    }

    wallet.availableBalance -= numericAmount;
    wallet.totalWithdraw += numericAmount;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.userId,
      type: 'WITHDRAW_REQUEST',
      amount: numericAmount,
      currency: 'INR',
      status: 'PENDING',
      meta: { method: payoutMethod, account: payoutAccount },
    });

    res.status(201).json({ wallet, transaction: tx });
  } catch (err) {
    console.error('Withdraw request error', err);
    res.status(500).json({ message: 'Failed to create withdraw request' });
  }
}

async function adminManualRecharge(req, res) {
  try {
    const { userId, amount, note } = req.body;

    const numericAmount = Number(amount);
    if (!userId || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'User and valid amount are required' });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for user' });
    }

    wallet.availableBalance += numericAmount;
    wallet.totalRecharge += numericAmount;
    await wallet.save();

    const tx = await Transaction.create({
      user: userId,
      type: 'RECHARGE',
      amount: numericAmount,
      currency: 'INR',
      status: 'SUCCESS',
      meta: { note: note || 'manual_recharge', adminId: req.userId },
    });

    res.status(201).json({ wallet, transaction: tx });
  } catch (err) {
    console.error('Admin manual recharge error', err);
    res.status(500).json({ message: 'Failed to recharge wallet' });
  }
}

module.exports = {
  getWalletSummary,
  requestWithdraw,
  adminManualRecharge,
  getPayoutSettings,
  updatePayoutSettings,
  getWithdrawRequests,
  approveWithdraw,
  rejectWithdraw,
};
