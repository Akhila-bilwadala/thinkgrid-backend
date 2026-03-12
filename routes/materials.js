import express from 'express';
import { 
  getMaterials, 
  getMaterial, 
  createMaterial, 
  deleteMaterial,
  likeMaterial,
  downloadMaterial,
  saveMaterial,
  unsaveMaterial
} from '../controllers/materialController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/',            authMiddleware, getMaterials);
router.get('/:id',         authMiddleware, getMaterial);
router.post('/',           authMiddleware, createMaterial);
router.delete('/:id',      authMiddleware, deleteMaterial);
router.put('/:id/like',    authMiddleware, likeMaterial);
router.put('/:id/download',authMiddleware, downloadMaterial);
router.post('/:id/save',   authMiddleware, saveMaterial);
router.post('/:id/unsave', authMiddleware, unsaveMaterial);

export default router;