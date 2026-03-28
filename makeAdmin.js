import mongoose from 'mongoose';

async function makeAdmin() {
  await mongoose.connect('mongodb+srv://thinkgrid:akhilabilwadala@cluster0.rcaqje1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
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
