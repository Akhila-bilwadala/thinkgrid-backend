import User from '../models/User.js';

// Helper: find or create user from JWT
const findOrCreateUser = async (jwtUser) => {
  let user = await User.findOne({ 
    $or: [{ _id: jwtUser.id }, { email: jwtUser.email }] 
  });

  if (!user) {
    user = await User.create({
      name:    jwtUser.name,
      email:   jwtUser.email,
      picture: jwtUser.picture || '',
      bio:     '',
      skills:  [],
    });
  }

  return user;
};

// ── GET /api/users/profile ────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await findOrCreateUser(req.user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, role, company, experience, achievements } = req.body;

    let user = await User.findOneAndUpdate(
      { $or: [{ _id: req.user.id }, { email: req.user.email }] },
      { name, bio, skills, role, company, experience, achievements },
      { new: true }
    );

    if (!user) {
      user = await findOrCreateUser(req.user);
      user = await User.findByIdAndUpdate(
        user._id,
        { name, bio, skills, role, company, experience, achievements },
        { new: true }
      );
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users ────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-email -password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/users/:id ─────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted ✅' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};