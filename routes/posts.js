import express from 'express';
import Post from '../models/Post.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET all posts for a room (with optional search)
router.get('/rooms/:roomId/posts', authMiddleware, async (req, res) => {
  const { search } = req.query;
  try {
    let query = { room: req.params.roomId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query).sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new post in a room
router.post('/rooms/:roomId/posts', authMiddleware, async (req, res) => {
  const { title, text, tag } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const post = await Post.create({
      room:       req.params.roomId,
      author:     req.user.id,
      authorName: req.user.name || 'Anonymous',
      title,
      text,
      tag: tag || 'Discussion',
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST toggle like on a post
router.post('/posts/:postId/toggle-like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const likedIndex = post.likedBy.indexOf(req.user.id);
    if (likedIndex > -1) {
      post.likedBy.splice(likedIndex, 1);
    } else {
      post.likedBy.push(req.user.id);
    }
    
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add a reply to a post
router.post('/rooms/:roomId/posts/:postId/reply', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: {
          replies: {
            author:     req.user.id,
            authorName: req.user.name || 'Anonymous',
            text,
          }
        }
      },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST toggle like on a reply
router.post('/posts/:postId/replies/:replyId/toggle-like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const likedIndex = reply.likedBy.indexOf(req.user.id);
    if (likedIndex > -1) {
      reply.likedBy.splice(likedIndex, 1);
    } else {
      reply.likedBy.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
