const mongoose = require('mongoose');
const User = require('../models/User');

async function listUsers(req, res) {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('phone nickname vipLevel isAdmin createdAt');

    res.json(users);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('List users admin error', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { isAdmin, vipLevel } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const update = {};

    if (typeof isAdmin === 'boolean') {
      update.isAdmin = isAdmin;
    }

    if (vipLevel !== undefined) {
      const parsedVip = Number(vipLevel);
      if (Number.isNaN(parsedVip) || parsedVip < 0) {
        return res.status(400).json({ message: 'VIP level must be a non-negative number' });
      }
      update.vipLevel = parsedVip;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
    }).select('phone nickname vipLevel isAdmin createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Update user admin error', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
}

module.exports = {
  listUsers,
  updateUser,
};
