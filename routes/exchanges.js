import express from 'express';
import { createExchangeRequest, getMyExchanges, updateExchangeStatus } from '../controllers/exchangeController.js';

// Assume there's an auth middleware already
import auth from '../middleware/auth.js'; 

const router = express.Router();

router.post('/', auth, createExchangeRequest);
router.get('/my', auth, getMyExchanges);
router.put('/:id', auth, updateExchangeStatus);

export default router;
