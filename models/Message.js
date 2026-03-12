import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { 
    type:     mongoose.Schema.Types.ObjectId, 
    ref:      'User', 
    required: true 
  },
  fromName: { 
    type:     String, 
    required: true 
  },
  to: { 
    type:    mongoose.Schema.Types.ObjectId, 
    ref:     'User', 
    default: null 
  },
  text: { 
    type:     String, 
    required: true 
  },
  type: { 
    type:    String, 
    enum:    ['open', 'direct'], 
    default: 'direct' 
  },
  read: { 
    type:    Boolean, 
    default: false 
  },
}, { timestamps: true });

// ✅ Auto-set type based on 'to' field
messageSchema.pre('save', function(next) {
  this.type = this.to ? 'direct' : 'open';
  next();
});

export default mongoose.model('Message', messageSchema);