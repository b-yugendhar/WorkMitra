import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    createAgreement,
    getEmployerAgreements,
    getMyAgreements,
    getAgreementById,
    updateAgreementStatus,
} from '../controllers/agreementController';
import {
    getAgreementUpdates,
    submitWorkProgress,
    approveWorkUpdate,
    markWorkCompleted,
} from '../controllers/workProgressController';

const router = express.Router();

router.post('/', protect, authorize('employer', 'admin'), createAgreement);
router.get('/employer', protect, authorize('employer', 'admin'), getEmployerAgreements);
router.get('/', protect, getMyAgreements);
router.get('/:id', protect, getAgreementById);
router.put('/:id/status', protect, updateAgreementStatus);

// Work Progress & Completion Routes
router.get('/:id/updates', protect, getAgreementUpdates);
router.put('/:id/progress', protect, submitWorkProgress);
router.post('/:id/approve-update', protect, authorize('employer', 'admin'), approveWorkUpdate);
router.post('/:id/complete', protect, authorize('employer', 'admin'), markWorkCompleted);

export default router;
