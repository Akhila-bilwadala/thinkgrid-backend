import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateAvatars = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany({}, { $set: { picture: '/default-avatar.png' } });
    console.log(`✅ Updated ${result.modifiedCount} users with default avatar.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    process.exit(1);
  }
};

updateAvatars();
