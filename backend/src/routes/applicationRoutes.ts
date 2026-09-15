import { Router } from 'express';
import { updateApplicationStatus, getMyApplications } from '../controllers/applicationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/my', protect, getMyApplications);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

export default router;
