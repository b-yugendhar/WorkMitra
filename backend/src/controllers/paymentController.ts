import { Request, Response } from 'express';
import Payment from '../models/Payment';
import WorkAgreement from '../models/WorkAgreement';
import { createNotification } from './notificationController';

// @desc    Initiate or record payment for an agreement
// @route   POST /api/payments
// @access  Private (Employer)
export const createPayment = async (req: Request, res: Response) => {
    try {
        const { agreementId, amount } = req.body;
        const user = (req as any).user;
        const employerId = user._id.toString();

        const agreement = await WorkAgreement.findById(agreementId);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        if (agreement.employerId.toString() !== employerId && user.role !== 'admin') {
            return res.status(403).json({ message: 'Only the employer for this agreement can process payment' });
        }

        // Prevent duplicate successful payments for same agreement
        const existingPaid = await Payment.findOne({ agreementId, status: 'paid' });
        if (existingPaid) {
            return res.status(400).json({ message: 'Payment has already been completed for this agreement' });
        }

        const payAmount = Number(amount || agreement.agreedWage);
        const paymentReference = `PAY-WM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const payment = await Payment.create({
            agreementId: agreement._id,
            workerId: agreement.workerId,
            employerId: agreement.employerId,
            amount: payAmount,
            status: 'paid', // Simulated server-side validation step
            paymentReference,
            paidAt: new Date(),
        });

        agreement.paymentStatus = 'released';
        if (agreement.status === 'active') {
            agreement.status = 'completed';
        }
        await agreement.save();

        // Notify worker
        await createNotification(
            agreement.workerId.toString(),
            'Payment Received! 💰',
            `Payment of ₹${payAmount.toLocaleString()} has been processed (Ref: ${paymentReference}).`,
            'success'
        );

        return res.status(201).json({
            message: 'Payment processed successfully (Simulated Gateway)',
            payment,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing payment', error: (error as Error).message });
    }
};

// @desc    Get employer payments
// @route   GET /api/payments/employer
// @access  Private (Employer)
export const getEmployerPayments = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const employerId = user._id;

        const payments = await Payment.find({ employerId })
            .populate('workerId', 'fullName phone email')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title' },
            })
            .sort({ createdAt: -1 });

        return res.json(payments);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching employer payments', error: (error as Error).message });
    }
};

// @desc    Get single payment details
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user._id.toString();

        const payment = await Payment.findById(id)
            .populate('workerId', 'fullName phone email')
            .populate('employerId', 'fullName phone email')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title location wage' },
            });

        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        const isParticipant =
            payment.workerId._id.toString() === userId ||
            payment.employerId._id.toString() === userId ||
            user.role === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view this payment' });
        }

        return res.json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching payment details', error: (error as Error).message });
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private (Employer / Admin)
export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = (req as any).user;
        const userId = user._id.toString();

        const payment = await Payment.findById(id);
        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        if (payment.employerId.toString() !== userId && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update payment status' });
        }

        payment.status = status;
        if (status === 'paid') payment.paidAt = new Date();
        await payment.save();

        return res.json(payment);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating payment status', error: (error as Error).message });
    }
};
