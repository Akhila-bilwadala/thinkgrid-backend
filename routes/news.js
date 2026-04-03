import express from 'express';
import { getLatestNews, updateNews } from '../controllers/newsController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

router.get('/', getLatestNews);
router.post('/update', authMiddleware, adminMiddleware, updateNews);

export default router;
