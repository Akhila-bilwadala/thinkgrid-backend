import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import Lab from '../models/Lab.js';

dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const roomUpdate = await Room.updateMany(
            { isApproved: { $ne: true } },
            { $set: { isApproved: true } }
        );
        console.log(`Updated ${roomUpdate.modifiedCount} rooms.`);

        const labUpdate = await Lab.updateMany(
            { isApproved: { $ne: true } },
            { $set: { isApproved: true } }
        );
        console.log(`Updated ${labUpdate.modifiedCount} labs.`);

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
