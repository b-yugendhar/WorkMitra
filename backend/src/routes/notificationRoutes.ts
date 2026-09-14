import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getUserNotifications, markAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
