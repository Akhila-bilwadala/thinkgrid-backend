import Room from '../models/Room.js';

// ── GET /api/rooms ────────────────────────────────────────────
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'name picture')
      .populate('members', 'name picture');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/rooms/my ─────────────────────────────────────────
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.user.id })
      .populate('createdBy', 'name picture')
      .populate('members', 'name picture');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/rooms/:id ────────────────────────────────────────
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'name picture')
      .populate('members', 'name picture')
      .populate('messages');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/rooms ───────────────────────────────────────────
export const createRoom = async (req, res) => {
  const { name, description, tags, isPrivate, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Title is required' });

  try {
    const room = await Room.create({
      name,
      description,
      tags:      tags || [],
      isPrivate: isPrivate ?? false,
      category:  category || 'General',
      createdBy: req.user.id,        // ✅ from JWT
      members:   [req.user.id],      // ✅ creator is first member
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/rooms/:id ────────────────────────────────────────
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id }, // ✅ only owner can update
      req.body,
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found or unauthorized' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/rooms/:id ─────────────────────────────────────
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id, // ✅ only owner can delete
    });
    if (!room) return res.status(404).json({ error: 'Room not found or unauthorized' });
    res.json({ message: 'Room deleted ✅' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/rooms/:id/join ──────────────────────────────────
export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user.id } }, // ✅ no duplicate members
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/rooms/:id/leave ─────────────────────────────────
export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.user.id } }, // ✅ remove from members
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};