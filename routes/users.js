import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getAllUsers,
  getUser,
  deleteUser,
  uploadProfilePicture,
  uploadBgPicture
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',                   authMiddleware, getAllUsers);
router.get('/profile',            authMiddleware, getProfile);
router.put('/profile',            authMiddleware, updateProfile);
router.put('/profile/picture',    authMiddleware, uploadProfilePicture);
router.put('/profile/bgpicture',  authMiddleware, uploadBgPicture);
router.get('/:id',                authMiddleware, getUser);
router.delete('/:id',             authMiddleware, deleteUser);

export default router; // ✅ 