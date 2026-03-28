import express from 'express';
import Room from '../models/Room.js';
import Material from '../models/Material.js';
import Lab from '../models/Lab.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

// Get all pending content
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rooms, materials, labs] = await Promise.all([
      Room.find({ isApproved: false }).populate('createdBy', 'name email'),
      Material.find({ isApproved: false }).populate('uploadedBy', 'name email'),
      Lab.find({ isApproved: false }).populate('createdBy', 'name email')
    ]);

    res.json({
      rooms,
      materials,
      projects: labs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending content' });
  }
});

// Approve specific content
router.patch('/approve/:type/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { type, id } = req.params;
  let model;

  if (type === 'room') model = Room;
  else if (type === 'material') model = Material;
  else if (type === 'project') model = Lab;
  else return res.status(400).json({ error: 'Invalid content type' });

  try {
    const updated = await model.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Content not found' });
    res.json({ message: 'Content approved locally', item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

// Reject (Delete) specific content
router.delete('/reject/:type/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { type, id } = req.params;
  let model;

  if (type === 'room') model = Room;
  else if (type === 'material') model = Material;
  else if (type === 'project') model = Lab;
  else return res.status(400).json({ error: 'Invalid content type' });

  try {
    const deleted = await model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Content not found' });
    res.json({ message: 'Content rejected and deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject content' });
  }
});

export default router;
