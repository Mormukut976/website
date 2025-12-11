const express = require('express');

const {
  getPublicPosts,
  getAllPostsAdmin,
  createPostAdmin,
  updatePostAdmin,
  deletePostAdmin,
} = require('../controllers/blogController');
const { authRequired, adminRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPublicPosts);

router.get('/admin', authRequired, adminRequired, getAllPostsAdmin);
router.post('/admin', authRequired, adminRequired, createPostAdmin);
router.put('/admin/:id', authRequired, adminRequired, updatePostAdmin);
router.delete('/admin/:id', authRequired, adminRequired, deletePostAdmin);

module.exports = router;
