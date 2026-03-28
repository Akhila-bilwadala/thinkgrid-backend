import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = db.collection('users');
  const user = await users.findOne({});
  if (user) {
    await users.updateOne({_id: user._id}, {$set: {role: 'admin'}});
    console.log('User made admin:', user.email);
  } else {
    console.log('No users found.');
  }
  process.exit(0);
}

makeAdmin();
