
import express from 'express';
import { getExplore, search } from '../controllers/exploreController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',       authMiddleware, getExplore);
router.get('/search', authMiddleware, search);

export default router;