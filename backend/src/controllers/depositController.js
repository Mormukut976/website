const DepositRequest = require('../models/DepositRequest');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

const MIN_DEPOSIT = Number(process.env.MIN_DEPOSIT || 150);
const DEFAULT_UPI_ID = process.env.UPI_ID || 'banadrabar@ybl';

async function getPublicConfig(req, res) {
  res.json({
    minDeposit: MIN_DEPOSIT,
    upiId: DEFAULT_UPI_ID,
  });
}

async function createDepositRequest(req, res) {
  try {
    const { amount, txnId, upiId } = req.body;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (numericAmount < MIN_DEPOSIT) {
      return res
        .status(400)
        .json({ message: `Minimum deposit amount is ₹${MIN_DEPOSIT}` });
    }

    const deposit = await DepositRequest.create({
      user: req.userId,
      amount: numericAmount,
      currency: 'INR',
      upiId: upiId || DEFAULT_UPI_ID,
      txnId,
    });

    res.status(201).json(deposit);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Create deposit request error', err);
    res.status(500).json({ message: 'Failed to create deposit request' });
  }
}

async function getMyDeposits(req, res) {
  try {
    const deposits = await DepositRequest.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get my deposits error', err);
    res.status(500).json({ message: 'Failed to load deposit requests' });
  }
}

async function getAllDeposits(req, res) {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const deposits = await DepositRequest.find(query)
      .populate('user', 'phone nickname')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get all deposits error', err);
    res.status(500).json({ message: 'Failed to load deposit requests' });
  }
}

async function approveDeposit(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    const deposit = await DepositRequest.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ message: 'Deposit request already processed' });
    }

    let wallet = await Wallet.findOne({ user: deposit.user });
    if (!wallet) {
      wallet = await Wallet.create({ user: deposit.user });
    }

    wallet.availableBalance += deposit.amount;
    wallet.totalRecharge += deposit.amount;
    await wallet.save();

    await Transaction.create({
      user: deposit.user,
      type: 'RECHARGE',
      amount: deposit.amount,
      currency: deposit.currency,
      status: 'SUCCESS',
      meta: {
        depositRequestId: deposit._id,
        upiId: deposit.upiId,
        txnId: deposit.txnId,
        adminId: req.userId,
        note: note || 'deposit_approved',
      },
    });

    deposit.status = 'APPROVED';
    deposit.handledBy = req.userId;
    deposit.handledAt = new Date();
    deposit.note = note || deposit.note;
    await deposit.save();

    res.json({ deposit, wallet });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Approve deposit error', err);
    res.status(500).json({ message: 'Failed to approve deposit request', error: err.message });
  }
}

async function rejectDeposit(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const deposit = await DepositRequest.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    if (deposit.status !== 'PENDING') {
      return res.status(400).json({ message: 'Deposit request already processed' });
    }

    deposit.status = 'REJECTED';
    deposit.handledBy = req.userId;
    deposit.handledAt = new Date();
    deposit.note = note || deposit.note;
    await deposit.save();

    res.json(deposit);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Reject deposit error', err);
    res.status(500).json({ message: 'Failed to reject deposit request' });
  }
}

module.exports = {
  getPublicConfig,
  createDepositRequest,
  getMyDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
};
