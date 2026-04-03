import Lab from '../models/Lab.js';

// ── GET /api/labs ─────────────────────────────────────────────
export const getLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ isApproved: true })
      .populate('members', 'name picture')
      .populate('pendingMembers', 'name picture')
      .sort({ createdAt: -1 });
    res.json(labs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/labs/my ──────────────────────────────────────────
export const getMyLabs = async (req, res) => {
  try {
    const userId = req.user.id;
    const labs = await Lab.find({
      $or: [{ createdBy: userId }, { members: userId }, { pendingMembers: userId }]
    })
    .populate('members', 'name picture')
    .populate('pendingMembers', 'name picture')
    .sort({ createdAt: -1 });

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
      recruitDeadline,
      createdBy:   req.user?.id,
      members:     [req.user?.id], // ✅ Creator is first member
      isApproved:  false, // ✅ New projects require admin approval
    });

    res.status(201).json(lab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── POST /api/labs/join/:id ───────────────────────────────────
export const requestToJoin = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ message: 'Project not found' });
    
    const members = lab.members || [];
    const pendingMembers = lab.pendingMembers || [];
    
    if (members.some(m => m.toString() === req.user.id) || 
        pendingMembers.some(pm => pm.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already a member or requested' });
    }

    if (members.length >= (lab.maxMembers || 5)) {
      return res.status(400).json({ message: 'Project is full' });
    }

    if (!lab.pendingMembers) lab.pendingMembers = [];
    lab.pendingMembers.push(req.user.id);
    await lab.save();
    res.json({ message: 'Join request sent! ✅' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/labs/approve/:id/:userId ───────────────────────
export const approveMember = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) return res.status(404).json({ message: 'Project not found' });

    // Verify requester is the host
    if (lab.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can approve members' });
    }

    const { userId } = req.params;
    const pendingMembers = lab.pendingMembers || [];
    if (!pendingMembers.some(id => id.toString() === userId)) {
      return res.status(400).json({ message: 'User not in pending list' });
    }

    const members = lab.members || [];
    if (members.length >= (lab.maxMembers || 5)) {
      return res.status(400).json({ message: 'Project capacity reached' });
    }

    // Move from pending to members
    lab.pendingMembers = (lab.pendingMembers || []).filter(id => id.toString() !== userId);
    if (!lab.members) lab.members = [];
    lab.members.push(userId);
    await lab.save();

    res.json({ message: 'Member approved! 🚀' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
