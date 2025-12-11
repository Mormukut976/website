const express = require('express');

const {
  getActivePlans,
  seedDefaultPlans,
  investInPlan,
  getMyInvestments,
  getAllPlansAdmin,
  createPlanAdmin,
  updatePlanAdmin,
} = require('../controllers/planController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authRequired, getActivePlans);
router.post('/seed', authRequired, adminRequired, seedDefaultPlans);
router.post('/invest', authRequired, investInPlan);
router.get('/mine', authRequired, getMyInvestments);

router.get('/admin', authRequired, adminRequired, getAllPlansAdmin);
router.post('/admin', authRequired, adminRequired, createPlanAdmin);
router.put('/admin/:id', authRequired, adminRequired, updatePlanAdmin);

module.exports = router;
