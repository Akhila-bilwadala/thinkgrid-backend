import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, // ✅ Store hashed password, hide by default
  picture:  { type: String, default: '' },
  bio:      { type: String, default: '' },
  skills:   { type: [String], default: [] },
  followers:{ type: Number, default: 0 },
  following:{ type: Number, default: 0 },
  points:   { type: Number, default: 0 },
  rank:     { type: String, default: 'Member' },
  streak:   { type: Number, default: 0 },
  role:     { type: String, default: 'Elite Member' },
  company:  { type: String, default: 'ThinkGrid' },
  experience: [{
    company: String,
    role: String,
    type: String,
    duration: String,
    desc: String
  }],
  achievements: [{
    icon: String,
    text: String
  }],
  verified: { type: Boolean, default: false },
}, { timestamps: true }); // ✅ auto adds createdAt & updatedAt

export default mongoose.model('User', userSchema);