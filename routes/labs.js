import express from 'express';
import { getLabs, createLab } from '../controllers/labController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',            getLabs);
router.post('/',           authMiddleware, createLab);

export default router;
