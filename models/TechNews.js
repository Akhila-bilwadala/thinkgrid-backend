import mongoose from 'mongoose';

const techNewsSchema = new mongoose.Schema({
  news: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('TechNews', techNewsSchema);
