import Message from '../models/Message.js';

// ── GET /api/messages ─────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id },  // ✅ sent by user
        { to: req.user.id },    // ✅ received by user
        { type: 'open' },       // ✅ open requests
      ],
    })
    .populate('from', 'name picture')
    .populate('to', 'name picture')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/messages/:userId ─────────────────────────────────
export const getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id,       to: req.params.userId }, // ✅ sent to user
        { from: req.params.userId, to: req.user.id },       // ✅ received from user
      ],
    })
    .populate('from', 'name picture')
    .populate('to', 'name picture')
    .sort({ createdAt: 1 }); // ✅ oldest first for conversation

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/messages/open ────────────────────────────────────
export const getOpenRequests = async (req, res) => {
  try {
    const messages = await Message.find({ type: 'open' })
      .populate('from', 'name picture')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/messages ────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { to, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    const message = await Message.create({
      from:     req.user.id,   // ✅ from JWT
      fromName: req.user.name,
      to:       to || null,    // ✅ null for open requests
      text,
      type:     to ? 'direct' : 'open', // ✅ auto set type
      read:     false,
    });

    // ✅ populate before returning
    await message.populate('from', 'name picture');
    await message.populate('to', 'name picture');

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/messages/:id/read ────────────────────────────────
export const markRead = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.user.id }, // ✅ only recipient can mark read
      { read: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};