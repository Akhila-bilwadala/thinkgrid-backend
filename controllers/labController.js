import Lab from '../models/Lab.js';

// ── GET /api/labs ─────────────────────────────────────────────
export const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });
    res.json(labs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/labs ────────────────────────────────────────────
export const createLab = async (req, res) => {
  const { title, description, repoUrl, maxMembers, tags, host, hostEmail, recruitDeadline } = req.body;
  
  if (!title || !description || !host || !hostEmail) {
    return res.status(400).json({ error: 'Title, Description, Host Name and Email are required' });
  }

  try {
    const lab = await Lab.create({
      title,
      description,
      repoUrl:     repoUrl || '',
      maxMembers:  maxMembers || 5,
      tags:        tags || [],
      host,
      hostEmail,
      recruitDeadline, // ✅ Store deadline
      createdBy:   req.user?.id,
    });

    res.status(201).json(lab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
