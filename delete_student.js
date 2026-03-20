import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const allUsers = await User.find();
        console.log('All Users:', JSON.stringify(allUsers, null, 2));

        const result = await User.deleteMany({ 
            $or: [
                { name: /STUDENT/i },
                { role: /STUDENT/i },
                { email: /STUDENT/i }
            ]
        });
        
        console.log(`Deleted ${result.deletedCount} user(s).`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
