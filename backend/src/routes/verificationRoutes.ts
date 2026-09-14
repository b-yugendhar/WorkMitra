import express from 'express';
import { submitEvidence, reviewEvidence } from '../controllers/verificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/submit', protect, submitEvidence);
router.put('/:id/review', protect, reviewEvidence);

export default router;
