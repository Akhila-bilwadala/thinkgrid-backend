import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, default: 'document' },
  url:         { type: String, default: '' },
  instructor:  { type: String, default: 'Elite Mentor' },
  resources:   [{ 
    name: String, 
    type: { type: String, default: 'PDF' }, 
    size: String 
  }],
  category:    { type: String, default: 'General' },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ links to User
  room:        { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // ✅ links to Room
  tags:        { type: [String], default: [] },
  likes:       { type: Number, default: 0 },
  downloads:   { type: Number, default: 0 },
  savedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ✅ users who saved this
}, { timestamps: true }); // ✅ auto adds createdAt & updatedAt

export default mongoose.model('Material', materialSchema);



