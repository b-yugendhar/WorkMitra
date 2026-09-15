import { Router } from 'express';
import { createDispute, getMyDisputes, getDisputeById } from '../controllers/disputeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createDispute);
router.get('/my', protect, getMyDisputes);
router.get('/:id', protect, getDisputeById);

export default router;
