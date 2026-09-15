import { Request, Response } from 'express';
import Dispute from '../models/Dispute';
import WorkAgreement from '../models/WorkAgreement';
import { createNotification } from './notificationController';

// @desc    Raise a dispute for an agreement
// @route   POST /api/disputes
// @access  Private (Agreement Participants)
export const createDispute = async (req: Request, res: Response) => {
    try {
        const { agreementId, reason, description, evidence } = req.body;
        const user = (req as any).user;
        const userId = user._id.toString();

        if (!agreementId || !reason || !description) {
            return res.status(400).json({ message: 'Please provide agreementId, reason, and description' });
        }

        const agreement = await WorkAgreement.findById(agreementId);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        const isWorker = agreement.workerId.toString() === userId;
        const isEmployer = agreement.employerId.toString() === userId;

        if (!isWorker && !isEmployer && user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only raise disputes for agreements you participate in' });
        }

        const againstUser = isWorker ? agreement.employerId : agreement.workerId;

        const dispute = await Dispute.create({
            agreementId: agreement._id,
            raisedBy: userId,
            againstUser,
            reason: reason.trim(),
            description: description.trim(),
            evidence: Array.isArray(evidence) ? evidence : [],
            status: 'open',
        });

        // Update agreement status to disputed
        agreement.status = 'disputed';
        await agreement.save();

        // Notify counterpart and admin
        await createNotification(
            againstUser.toString(),
            'Dispute Raised ⚠️',
            `A dispute was raised regarding agreement for contract "${reason}". WorkMitra admin will review.`,
            'warning'
        );

        return res.status(201).json({ message: 'Dispute raised successfully', dispute });
    } catch (error) {
        return res.status(500).json({ message: 'Error raising dispute', error: (error as Error).message });
    }
};

// @desc    Get user's disputes
// @route   GET /api/disputes/my
// @access  Private
export const getMyDisputes = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user._id;

        const disputes = await Dispute.find({
            $or: [{ raisedBy: userId }, { againstUser: userId }],
        })
            .populate('raisedBy', 'fullName phone role')
            .populate('againstUser', 'fullName phone role')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title' },
            })
            .sort({ createdAt: -1 });

        return res.json(disputes);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching disputes', error: (error as Error).message });
    }
};

// @desc    Get single dispute by ID
// @route   GET /api/disputes/:id
// @access  Private (Participants & Admin)
export const getDisputeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user._id.toString();

        const dispute = await Dispute.findById(id)
            .populate('raisedBy', 'fullName phone email role')
            .populate('againstUser', 'fullName phone email role')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title wage location' },
            });

        if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

        const isParticipant =
            dispute.raisedBy._id.toString() === userId ||
            dispute.againstUser._id.toString() === userId ||
            user.role === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view this dispute' });
        }

        return res.json(dispute);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching dispute details', error: (error as Error).message });
    }
};
