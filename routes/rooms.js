import express from 'express'; // ✅ missing import
import { 
  getRooms, 
  getMyRooms, 
  getRoom, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  joinRoom,   // ✅ add this
  leaveRoom   // ✅ add this
} from '../controllers/roomController.js'; // ✅ check filename (roomsController vs roomController)
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',            authMiddleware, getRooms);
router.get('/my',          authMiddleware, getMyRooms);
router.get('/:id',         authMiddleware, getRoom);
router.post('/',           authMiddleware, createRoom);
router.put('/:id',         authMiddleware, updateRoom);
router.delete('/:id',      authMiddleware, deleteRoom);
router.post('/:id/join',   authMiddleware, joinRoom);   // ✅ new
router.post('/:id/leave',  authMiddleware, leaveRoom);  // ✅ new

export default router;