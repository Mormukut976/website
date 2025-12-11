const BlogPost = require('../models/BlogPost');

async function getPublicPosts(req, res) {
  try {
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get blog posts error', err);
    res.status(500).json({ message: 'Failed to load blog posts' });
  }
}

async function getAllPostsAdmin(req, res) {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Get all blog posts admin error', err);
    res.status(500).json({ message: 'Failed to load blog posts' });
  }
}

async function createPostAdmin(req, res) {
  try {
    const { title, content, coverImageUrl, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await BlogPost.create({
      title,
      content,
      coverImageUrl,
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
      createdBy: req.userId,
    });

    res.status(201).json(post);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Create blog post admin error', err);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
}

async function updatePostAdmin(req, res) {
  try {
    const { id } = req.params;
    const update = req.body;

    const post = await BlogPost.findByIdAndUpdate(id, update, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Update blog post admin error', err);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
}

async function deletePostAdmin(req, res) {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Delete blog post admin error', err);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
}

module.exports = {
  getPublicPosts,
  getAllPostsAdmin,
  createPostAdmin,
  updatePostAdmin,
  deletePostAdmin,
};
