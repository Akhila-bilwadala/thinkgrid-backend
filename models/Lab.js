import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  repoUrl:     { type: String, default: '' },
  maxMembers:  { type: Number, default: 5 },
  members:     { type: Number, default: 1 },
  tags:        { type: [String], default: [] },
  host:        { type: String, required: true },
  hostEmail:   { type: String, required: true },
  recruitDeadline: { type: Date }, // ✅ Added recruitment deadline
  status:      { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  stars:       { type: Number, default: 0 },
  isApproved:  { type: Boolean, default: false }, // ✅ Admin approval flag
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Lab', labSchema);
