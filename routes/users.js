import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getAllUsers,
  getUser,      // ✅ add this
  deleteUser    // ✅ add this
} from '../controllers/userController.js'; // ✅ check filename (usersController vs userController)
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',          authMiddleware, getAllUsers);
router.get('/profile',   authMiddleware, getProfile);
router.put('/profile',   authMiddleware, updateProfile);
router.get('/:id',       authMiddleware, getUser);    // ✅ new
router.delete('/:id',    authMiddleware, deleteUser); // ✅ new

export default router; // ✅ 