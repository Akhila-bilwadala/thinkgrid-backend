import express from 'express';
import { 
  getMessages, 
  getConversation, 
  sendMessage, 
  markRead,
  getOpenRequests  // ✅ add this
} from '../controllers/messageController.js'; // ✅ check filename
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',             authMiddleware, getMessages);
router.get('/open',         authMiddleware, getOpenRequests); // ✅ new - must be BEFORE /:userId
router.get('/:userId',      authMiddleware, getConversation);
router.post('/',            authMiddleware, sendMessage);
router.put('/:id/read',     authMiddleware, markRead);

export default router;