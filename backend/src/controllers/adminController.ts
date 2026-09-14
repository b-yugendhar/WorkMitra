import { Request, Response } from 'express';
import User from '../models/User';
import WorkAgreement from '../models/WorkAgreement';
import Payment from '../models/Payment';
import AuditLog from '../models/AuditLog';
import VerificationRequest from '../models/VerificationRequest';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeAgreements = await WorkAgreement.countDocuments({ status: 'active' });

        // Mock revenue/escrow calculations
        const escrowPayments = await Payment.find({ status: 'pending' });
        const totalEscrow = escrowPayments.reduce((acc, p) => acc + p.amount, 0);

        // Fetch some monthly mock data for recharts
        const mockRevenueData = [
            { month: 'Jan', revenue: 4000 },
            { month: 'Feb', revenue: 3000 },
            { month: 'Mar', revenue: 5000 },
            { month: 'Apr', revenue: 2780 },
            { month: 'May', revenue: 8900 },
            { month: 'Jun', revenue: 10200 },
        ];

        res.json({
            totalUsers,
            activeAgreements,
            totalEscrow,
            revenueData: mockRevenueData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: (error as Error).message });
    }
};

// @desc    Get all disputes
// @route   GET /api/admin/disputes
// @access  Private (Admin)
export const getDisputes = async (req: Request, res: Response) => {
    try {
        const disputes = await WorkAgreement.find({ status: 'disputed' })
            .populate('workerId', 'name phone')
            .populate('employerId', 'name phone')
            .populate('jobId', 'title');

        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching disputes', error: (error as Error).message });
    }
};

// @desc    Resolve a dispute
// @route   POST /api/admin/disputes/:id/resolve
// @access  Private (Admin)
export const resolveDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resolution, details } = req.body; // 'refund_employer' or 'pay_worker'

        const agreement = await WorkAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        if (resolution === 'refund_employer') {
            agreement.paymentStatus = 'released';
            agreement.status = 'completed';
        } else if (resolution === 'pay_worker') {
            agreement.paymentStatus = 'released';
            agreement.status = 'completed';
        }

        await agreement.save();

        // Log the audit
        // @ts-ignore
        await AuditLog.create({
            // @ts-ignore
            adminId: req.user._id,
            actionType: 'RESOLVE_DISPUTE',
            details: `Resolved dispute with: ${resolution}. Note: ${details}`,
            targetId: agreement._id
        });

        res.json({ message: 'Dispute resolved successfully', agreement });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving dispute', error: (error as Error).message });
    }
};
