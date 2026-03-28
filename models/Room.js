

import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ links to User
  category:    { type: String, default: 'General' },
  isPrivate:   { type: Boolean, default: false },
  image:       { type: String, default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ✅ array of Users
  messages:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // ✅ links to Message
  isApproved:  { type: Boolean, default: false }, // ✅ Admin approval flag
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);