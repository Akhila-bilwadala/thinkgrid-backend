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
    const { name, bio, skills, role, company, experience, achievements, portfolioUrl, linkedinUrl, githubUrl } = req.body;

    console.log('--- Incoming Profile Data ---');
    console.log('Type of experience:', typeof experience, Array.isArray(experience) ? 'is Array' : 'not Array');
    console.log('First exp item type:', experience && experience[0] ? typeof experience[0] : 'n/a');
    
    let user = await User.findOneAndUpdate(
      { $or: [{ _id: req.user.id }, { email: req.user.email }] },
      { name, bio, skills, role, company, experience, achievements, portfolioUrl, linkedinUrl, githubUrl },
      { new: true }
    );

    if (!user) {
      user = await findOrCreateUser(req.user);
      user = await User.findByIdAndUpdate(
        user._id,
        { name, bio, skills, role, company, experience, achievements, portfolioUrl, linkedinUrl, githubUrl },
        { new: true }
      );
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/profile/picture ───────────────────────────
export const uploadProfilePicture = async (req, res) => {
  try {
    const { picture } = req.body;
    if (!picture) return res.status(400).json({ message: 'No picture data provided' });

    const user = await User.findOneAndUpdate(
      { $or: [{ _id: req.user.id }, { email: req.user.email }] },
      { picture },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ picture: user.picture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/profile/bgpicture ─────────────────────────
export const uploadBgPicture = async (req, res) => {
  try {
    const { bgPicture } = req.body;
    if (!bgPicture) return res.status(400).json({ message: 'No bgPicture data provided' });

    const user = await User.findOneAndUpdate(
      { $or: [{ _id: req.user.id }, { email: req.user.email }] },
      { bgPicture },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ bgPicture: user.bgPicture });
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