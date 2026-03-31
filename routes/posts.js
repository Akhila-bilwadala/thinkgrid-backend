import express from 'express';
import Post from '../models/Post.js';
import authMiddleware from '../middleware/auth.js';
import uploadPost from '../middleware/uploadPost.js';

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

    const posts = await Post.find(query)
      .populate('author', 'name picture role')
      .populate('replies.author', 'name picture role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new post in a room
router.post('/rooms/:roomId/posts', [authMiddleware, uploadPost.single('image')], async (req, res) => {
  const { title, text, tag } = req.body;
  
  if (!text) {
    console.error('DEBUG: Post creation failed - Missing "text" field');
    console.error('Headers:', JSON.stringify(req.headers, null, 2));
    console.error('Body Keys:', Object.keys(req.body));
    console.error('Raw Body (truncated):', JSON.stringify(req.body).substring(0, 500));
    
    return res.status(400).json({ 
      error: 'Text is required',
      debug: {
        bodyKeys: Object.keys(req.body),
        contentType: req.headers['content-type']
      }
    });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/posts/${req.file.filename}`;
  }

  try {
    const post = await Post.create({
      room:       req.params.roomId,
      author:     req.user.id,
      authorName: req.user.name || 'Anonymous',
      title,
      text,
      tag: tag || 'Discussion',
      image: imageUrl,
    });
    
    const populatedPost = await Post.findById(post._id).populate('author', 'name picture role');
    res.status(201).json(populatedPost);
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
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name picture role')
      .populate('replies.author', 'name picture role');

    res.json(populatedPost);
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
