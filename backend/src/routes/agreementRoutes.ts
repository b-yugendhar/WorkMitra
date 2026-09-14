import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createAgreement, getMyAgreements, updateAgreementStatus, processPayment } from '../controllers/agreementController';

const router = express.Router();

router.post('/', protect, createAgreement);
router.get('/', protect, getMyAgreements);
router.put('/:id/status', protect, updateAgreementStatus);
router.post('/:id/pay', protect, processPayment);

export default router;
