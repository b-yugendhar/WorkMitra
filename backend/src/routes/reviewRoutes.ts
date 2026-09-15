import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createReview, getMyReviews, getUserReviews } from '../controllers/reviewController';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.get('/:userId', getUserReviews);

export default router;
