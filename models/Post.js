import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  text:       { type: String, required: true },
  likedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  title:      { type: String, default: '' },
  text:       { type: String, required: true },
  image:      { type: String }, // ✅ For attachments
  tag:        { type: String, default: 'Discussion' }, // 'Discussion', 'Question', 'Update', 'Tech Update', 'Fix/Help'
  isPinned:   { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  likedBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies:    [replySchema],
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
