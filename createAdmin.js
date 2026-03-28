import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = db.collection('users');

  const hash = await bcrypt.hash('password', 10);

  await users.findOneAndUpdate(
    { email: 'admin@123' },
    {
      $set: {
        name: 'Admin',
        email: 'admin@123',
        password: hash,
        role: 'admin',
        college: 'ThinkGrid HQ',
        skills: [],
      }
    },
    { upsert: true }
  );

  console.log('✅ Admin user created/updated: admin@123 / password');
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
