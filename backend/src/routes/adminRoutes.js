const express = require('express');

const { listUsers, updateUser } = require('../controllers/adminController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', authRequired, adminRequired, listUsers);
router.put('/users/:id', authRequired, adminRequired, updateUser);

module.exports = router;
