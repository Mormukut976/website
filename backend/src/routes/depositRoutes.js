const express = require('express');

const {
  getPublicConfig,
  createDepositRequest,
  getMyDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
} = require('../controllers/depositController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');

const router = express.Router();

// Public config (UPI ID, min deposit)
router.get('/config', getPublicConfig);

// User routes
router.post('/', authRequired, createDepositRequest);
router.get('/mine', authRequired, getMyDeposits);

// Admin routes
router.get('/admin', authRequired, adminRequired, getAllDeposits);
router.post('/admin/:id/approve', authRequired, adminRequired, approveDeposit);
router.post('/admin/:id/reject', authRequired, adminRequired, rejectDeposit);

module.exports = router;
