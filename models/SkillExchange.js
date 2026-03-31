import mongoose from 'mongoose';

const skillExchangeSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  topic: { 
    type: String, 
    required: true 
  },
  credits: { 
    type: Number, 
    default: 50 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'reschedule_requested', 'scheduled', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  scheduleDate: { 
    type: Date 
  },
  durationMinutes: {
    type: Number,
    default: 60
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meetingLink: { 
    type: String, 
    default: '' 
  },
  rating: { 
    type: Number, 
    min: 0, 
    max: 5 
  },
  review: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

export default mongoose.model('SkillExchange', skillExchangeSchema);
