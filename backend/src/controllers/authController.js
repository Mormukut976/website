const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Wallet = require('../models/Wallet');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, phone: user.phone, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function generateUniqueInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;

  while (exists) {
    code = Array.from({ length: 6 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');

    // eslint-disable-next-line no-await-in-loop
    const existing = await User.findOne({ inviteCode: code });
    exists = !!existing;
  }

  return code;
}

async function register(req, res) {
  try {
    const { phone, password, nickname, inviteCode } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'Phone already registered' });
    }

    let referredBy = null;
    if (inviteCode) {
      const refUser = await User.findOne({ inviteCode });
      if (refUser) {
        referredBy = refUser._id;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newInviteCode = await generateUniqueInviteCode();

    const userCount = await User.countDocuments();

    const user = await User.create({
      phone,
      passwordHash,
      nickname,
      referredBy,
      inviteCode: newInviteCode,
      // make the very first user an admin so you can manage plans and recharges
      isAdmin: userCount === 0,
    });

    await Wallet.create({ user: user._id });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        vipLevel: user.vipLevel,
        isAdmin: user.isAdmin,
        inviteCode: user.inviteCode,
      },
    });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        vipLevel: user.vipLevel,
        isAdmin: user.isAdmin,
        inviteCode: user.inviteCode,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Login failed' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wallet = await Wallet.findOne({ user: user._id });

    res.json({ user, wallet });
  } catch (err) {
    console.error('Get profile error', err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
};
