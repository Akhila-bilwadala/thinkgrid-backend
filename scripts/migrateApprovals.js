import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import Material from '../models/Material.js';
import Lab from '../models/Lab.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migration...');

    const roomRes = await Room.updateMany({}, { $set: { isApproved: true } });
    console.log(`Updated ${roomRes.modifiedCount} Rooms`);

    const matRes = await Material.updateMany({}, { $set: { isApproved: true } });
    console.log(`Updated ${matRes.modifiedCount} Materials`);

    const labRes = await Lab.updateMany({}, { $set: { isApproved: true } });
    console.log(`Updated ${labRes.modifiedCount} Labs`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
