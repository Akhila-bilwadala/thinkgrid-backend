import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roomRoutes from './routes/rooms.js';
import materialRoutes from './routes/materials.js';
import messageRoutes from './routes/messages.js';
import exploreRoutes from './routes/explore.js';
import postRoutes from './routes/posts.js';
import labRoutes from './routes/labs.js';
import exchangeRoutes from './routes/exchanges.js';
import adminRoutes from './routes/admin.js';
import newsRoutes from './routes/news.js';
import aiRoutes from './routes/ai.js';



const app = express();
const PORT = process.env.PORT || 5000;

// Logging for debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://thinkgrid-one.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/rooms',     roomRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/messages',  messageRoutes);
app.use('/api/explore',   exploreRoutes);
app.use('/api/labs',      labRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/news',      newsRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api',           postRoutes);

// Root Status Route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ThinkGrid API is Live ✅', version: '2.0.0 (Gemini 1.5 Pro Enabled)' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ThinkGrid API is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Connect MongoDB then start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  app.listen(PORT, () => {
    console.log(`✅ ThinkGrid API running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB Connection Failed:', err.message);
  process.exit(1);
});