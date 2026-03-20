import Material from '../models/Material.js';

// ── GET /api/materials ────────────────────────────────────────
export const getMaterials = async (req, res) => {
  try {
    const { tag } = req.query;

    const filter = tag ? { tags: tag } : {}; // ✅ filter by tag if provided

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name picture') // ✅ gets User details
      .populate('room', 'name')               // ✅ gets Room details
      .sort({ createdAt: -1 });               // ✅ newest first

    res.json(materials);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/materials/:id ────────────────────────────────────
export const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name picture')
      .populate('room', 'name');

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials ───────────────────────────────────────
export const createMaterial = async (req, res) => {
  const { title, type, category, tags, url, description, room } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  let finalUrl = url;
  let parsedTags = [];
  let resources = [];
  
  if (tags) {
      try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
          parsedTags = [tags];
      }
  }

  if (req.file) {
    finalUrl = `/uploads/materials/${req.file.filename}`;
    
    // Calculate size
    const sizeInBytes = req.file.size;
    const sizeStr = sizeInBytes > 1024 * 1024 
      ? (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (sizeInBytes / 1024).toFixed(2) + ' KB';
      
    resources.push({
      name: req.file.originalname,
      type: 'PDF', // Assuming PDF for now based on context
      size: sizeStr,
      url: finalUrl
    });
  }

  // Allow empty cards to be created without a file or url
  // if (!finalUrl) return res.status(400).json({ error: 'URL or File is required' });

  try {
    const material = await Material.create({
      title,
      type:        type || 'document',
      category:    category || 'General',
      tags:        parsedTags,
      url:         finalUrl,
      description: description || '',
      room:        room || undefined,
      uploadedBy:  req.user.id,
      resources:   resources,
      likes:       0,
      downloads:   0,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/materials/:id ─────────────────────────────────
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({
      _id:        req.params.id,
      uploadedBy: req.user.id, // ✅ only uploader can delete
    });

    if (!material) return res.status(404).json({ error: 'Material not found or unauthorized' });
    res.json({ message: 'Material deleted ✅' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/materials/:id/like ───────────────────────────────
export const likeMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // ✅ increment likes by 1
      { new: true }
    );

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/materials/:id/download ──────────────────────────
export const downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } }, // ✅ increment downloads by 1
      { new: true }
    );

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials/:id/save ──────────────────────────────
export const saveMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { savedBy: req.user.id } },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials/:id/unsave ────────────────────────────
export const unsaveMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $pull: { savedBy: req.user.id } },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};