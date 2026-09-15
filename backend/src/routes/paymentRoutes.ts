import { Router } from 'express';
import {
    createPayment,
    getEmployerPayments,
    getPaymentById,
    updatePaymentStatus,
} from '../controllers/paymentController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, authorize('employer', 'admin'), createPayment);
router.get('/employer', protect, authorize('employer', 'admin'), getEmployerPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id/status', protect, authorize('employer', 'admin'), updatePaymentStatus);

export default router;
