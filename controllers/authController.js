import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // ✅ password hashing
import User from '../models/User.js';

// Install: npm install bcryptjs

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ── Google Auth ───────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token is required' });
  }

  try {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // ✅ Find or create user in MongoDB
    let user = await User.findOne({ email: data.email });

    if (!user) {
      user = await User.create({
        name:     data.name,
        email:    data.email,
        picture:  data.picture,
        verified: true, // ✅ Google users are verified
      });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  let { email, password } = req.body;
  email = email?.toLowerCase().trim();

  try {
    // ✅ Find user in MongoDB
    console.log(`[LOGIN_DEBUG] Querying for: ${email}`);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`[LOGIN_DEBUG] User NOT FOUND: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN_DEBUG] Password match for ${email}: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    console.log(`[LOGIN_DEBUG] Login SUCCESS for ${email}`);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Register ──────────────────────────────────────────────────
export const register = async (req, res) => {
  let { name, email, password } = req.body;
  email = email?.toLowerCase().trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // ✅ Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Me ────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};