const express = require('express');

const {
  getWalletSummary,
  requestWithdraw,
  adminManualRecharge,
  getPayoutSettings,
  updatePayoutSettings,
  getWithdrawRequests,
  approveWithdraw,
  rejectWithdraw,
} = require('../controllers/walletController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authRequired, getWalletSummary);
router.post('/withdraw', authRequired, requestWithdraw);

router.get('/payout-settings', authRequired, getPayoutSettings);
router.put('/payout-settings', authRequired, updatePayoutSettings);

router.post('/admin/manual-recharge', authRequired, adminRequired, adminManualRecharge);
router.get('/admin/withdrawals', authRequired, adminRequired, getWithdrawRequests);
router.post('/admin/withdrawals/:id/approve', authRequired, adminRequired, approveWithdraw);
router.post('/admin/withdrawals/:id/reject', authRequired, adminRequired, rejectWithdraw);

module.exports = router;
