import User from '../models/User.js';

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error in admin authorization' });
  }
};

export default adminMiddleware;
