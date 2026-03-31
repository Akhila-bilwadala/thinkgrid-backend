import express from 'express';
import { getLabs, getMyLabs, createLab, requestToJoin, approveMember } from '../controllers/labController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',            getLabs);
router.get('/my',         authMiddleware, getMyLabs);
router.post('/',           authMiddleware, createLab);
router.post('/join/:id',   authMiddleware, requestToJoin);
router.patch('/approve/:id/:userId', authMiddleware, approveMember);

export default router;
