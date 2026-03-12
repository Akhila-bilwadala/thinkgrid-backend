import express from 'express';
import { googleAuth, login, register, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/google',   googleAuth);
router.post('/login',    login);
router.post('/register', register);
router.get('/me',        authMiddleware, getMe);

export default router;