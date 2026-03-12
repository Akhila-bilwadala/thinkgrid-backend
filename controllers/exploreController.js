import Room from '../models/Room.js';
import Material from '../models/Material.js';

// ── GET /api/explore ──────────────────────────────────────────
export const getExplore = async (req, res) => {
  try {
    // ✅ Get trending materials from MongoDB (sorted by likes)
    const trendingTopics = await Material.find()
      .sort({ likes: -1 })         // ✅ most liked first
      .limit(5)                     // ✅ top 5
      .populate('uploadedBy', 'name picture')
      .populate('room', 'name');

    // ✅ Get featured rooms from MongoDB (sorted by members count)
    const featuredRooms = await Room.find({ isPrivate: false })
      .sort({ createdAt: -1 })     // ✅ newest first
      .limit(6)                     // ✅ top 6
      .populate('createdBy', 'name picture')
      .select('name description members tags category');

    res.json({ trendingTopics, featuredRooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/explore/search?q= ────────────────────────────────
export const search = async (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

  try {
    const query = new RegExp(q, 'i'); // ✅ case-insensitive regex

    // ✅ Search materials by title or type
    const topics = await Material.find({
      $or: [
        { title: query },
        { type: query },
        { tags: query },
      ],
    })
    .populate('uploadedBy', 'name picture')
    .populate('room', 'name');

    // ✅ Search rooms by name, description or category
    const rooms = await Room.find({
      isPrivate: false,
      $or: [
        { name: query },
        { description: query },
        { category: query },
      ],
    })
    .populate('createdBy', 'name picture')
    .select('name description members tags category');

    res.json({ topics, rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
