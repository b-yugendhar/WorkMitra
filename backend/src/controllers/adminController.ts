import { Request, Response } from 'express';
import User from '../models/User';
import Job from '../models/Job';
import WorkAgreement from '../models/WorkAgreement';
import Dispute from '../models/Dispute';
import Payment from '../models/Payment';
import Application from '../models/Application';
import { createNotification } from './notificationController';

// Get real-time platform statistics from MongoDB
export const getPlatformStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();
        const workers = await User.countDocuments({ role: 'worker' });
        const employers = await User.countDocuments({ role: 'employer' });
        const admins = await User.countDocuments({ role: 'admin' });

        const totalJobs = await Job.countDocuments();
        const openJobs = await Job.countDocuments({ status: 'open' });
        const totalApplications = await Application.countDocuments();
        const totalAgreements = await WorkAgreement.countDocuments();
        const activeAgreements = await WorkAgreement.countDocuments({ status: 'active' });

        const totalDisputes = await Dispute.countDocuments();
        const openDisputes = await Dispute.countDocuments({ status: 'open' });

        const totalPayments = await Payment.countDocuments();
        const paidPayments = await Payment.find({ status: 'paid' });
        const totalVolume = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        res.status(200).json({
            totalUsers,
            workers,
            employers,
            admins,
            totalJobs,
            openJobs,
            totalApplications,
            totalAgreements,
            activeAgreements,
            totalDisputes,
            openDisputes,
            totalPayments,
            totalVolume,
        });
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Unable to fetch platform statistics',
        });
    }
};

// Get all real disputes from MongoDB
export const getDisputes = async (req: Request, res: Response): Promise<void> => {
    try {
        const disputes = await Dispute.find()
            .populate('raisedBy', 'fullName phone role email')
            .populate('againstUser', 'fullName phone role email')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title location wage' },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Real disputes retrieved from MongoDB',
            disputes,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Unable to fetch disputes',
            error: (error as Error).message,
        });
    }
};

// Resolve a dispute with admin resolution notes
export const resolveDispute = async (req: Request, res: Response): Promise<void> => {
    try {
        const { disputeId } = req.params;
        const { status = 'resolved', resolutionDetails = 'Resolved by WorkMitra Platform Admin.' } = req.body;

        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            res.status(404).json({ message: 'Dispute record not found' });
            return;
        }

        dispute.status = status;
        dispute.resolutionDetails = resolutionDetails;
        await dispute.save();

        // Notify both parties
        const disputeIdStr = String(disputeId || '');
        await createNotification(
            dispute.raisedBy.toString(),
            'Dispute Resolved ⚖️',
            `Your dispute #${disputeIdStr.slice(-6)} has been ${status.toUpperCase()}. Details: ${resolutionDetails}`,
            'success'
        );

        await createNotification(
            dispute.againstUser.toString(),
            'Dispute Case Update ⚖️',
            `The dispute regarding your contract has been marked ${status.toUpperCase()} by Admin.`,
            'info'
        );

        res.status(200).json({
            message: 'Dispute successfully updated and resolved',
            dispute,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Unable to resolve dispute',
            error: (error as Error).message,
        });
    }
};