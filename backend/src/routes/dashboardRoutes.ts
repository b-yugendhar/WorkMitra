import { Router } from 'express';
import { getEmployerDashboardStats } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/employer', protect, authorize('employer'), getEmployerDashboardStats);

export default router;
