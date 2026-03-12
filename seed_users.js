import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    name: 'Aiden Smith',
    email: 'aiden@example.com',
    role: 'Frontend Architect',
    rank: 'Mentor',
    skills: ['React', 'Next.js', 'WebAssembly'],
    bio: 'Passionate about building scalable and performant web applications.',
    picture: '/default-avatar.png'
  },
  {
    name: 'Sophia Chen',
    email: 'sophia@example.com',
    role: 'UI/UX Designer',
    rank: 'Member',
    skills: ['Figma', 'Adobe XD', 'Prototyping'],
    bio: 'Designing intuitive and beautiful user experiences.',
    picture: '/default-avatar.png'
  },
  {
    name: 'Marcus Thorne',
    email: 'marcus@example.com',
    role: 'Full Stack Developer',
    rank: 'Mentor',
    skills: ['Node.js', 'Go', 'PostgreSQL'],
    bio: 'Bridging the gap between frontend beauty and backend stability.',
    picture: '/default-avatar.png'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
        console.log(`✅ Created user: ${u.name}`);
      } else {
        console.log(`ℹ️ User already exists: ${u.name}`);
      }
    }

    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedUsers();
