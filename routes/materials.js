import express from 'express';
import { 
  getMaterials, 
  getMaterial, 
  createMaterial, 
  deleteMaterial,
  likeMaterial,
  downloadMaterial,
  saveMaterial,
  unsaveMaterial,
  chatWithMaterial,
  extractPdfText,
  askPdf
} from '../controllers/materialController.js';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/',            authMiddleware, getMaterials);
router.post('/extract-pdf', authMiddleware, upload.single('file'), extractPdfText);
router.post('/ask-pdf',     authMiddleware, askPdf);
router.get('/:id',         authMiddleware, getMaterial);
router.post('/',           authMiddleware, upload.single('file'), createMaterial);
router.delete('/:id',      authMiddleware, deleteMaterial);
router.put('/:id/like',    authMiddleware, likeMaterial);
router.put('/:id/download',authMiddleware, downloadMaterial);
router.post('/:id/save',   authMiddleware, saveMaterial);
router.post('/:id/unsave', authMiddleware, unsaveMaterial);
router.post('/:id/chat',   authMiddleware, chatWithMaterial);


export default router;