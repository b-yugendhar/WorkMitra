import { Request, Response } from 'express';
import WorkAgreement from '../models/WorkAgreement';
import WorkUpdate from '../models/WorkUpdate';
import { createNotification } from './notificationController';

// @desc    Get progress updates for an agreement
// @route   GET /api/agreements/:id/updates
// @access  Private (Agreement Participants)
export const getAgreementUpdates = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user._id.toString();

        const agreement = await WorkAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        const isParticipant =
            agreement.workerId.toString() === userId ||
            agreement.employerId.toString() === userId ||
            user.role === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view updates for this agreement' });
        }

        const updates = await WorkUpdate.find({ agreementId: id })
            .populate('workerId', 'fullName phone')
            .sort({ createdAt: -1 });

        return res.json(updates);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching progress updates', error: (error as Error).message });
    }
};

// @desc    Submit a work progress update
// @route   PUT /api/agreements/:id/progress
// @access  Private (Worker / Employer)
export const submitWorkProgress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message, progress, proofFiles } = req.body;
        const user = (req as any).user;
        const userId = user._id.toString();

        const agreement = await WorkAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        const isWorker = agreement.workerId.toString() === userId;
        const isEmployer = agreement.employerId.toString() === userId;

        if (!isWorker && !isEmployer && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update progress for this agreement' });
        }

        const progressNum = Number(progress);
        if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
            return res.status(400).json({ message: 'Progress percentage must be between 0 and 100' });
        }

        const update = await WorkUpdate.create({
            agreementId: agreement._id,
            workerId: agreement.workerId,
            employerId: agreement.employerId,
            message: message ? message.trim() : `Progress updated to ${progressNum}%`,
            progress: progressNum,
            proofFiles: Array.isArray(proofFiles) ? proofFiles : [],
            employerApproval: isEmployer ? 'approved' : 'pending',
        });

        // Notify employer if worker submitted update
        if (isWorker) {
            await createNotification(
                agreement.employerId.toString(),
                'New Work Progress Update 🛠️',
                `Worker submitted progress update (${progressNum}%). Review requested.`,
                'info'
            );
        }

        return res.status(201).json(update);
    } catch (error) {
        return res.status(500).json({ message: 'Error submitting progress update', error: (error as Error).message });
    }
};

// @desc    Approve or reject a work update
// @route   POST /api/agreements/:id/approve-update
// @access  Private (Employer)
export const approveWorkUpdate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { updateId, action } = req.body; // action: 'approved' | 'rejected'
        const user = (req as any).user;
        const userId = user._id.toString();

        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Action must be approved or rejected' });
        }

        const agreement = await WorkAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        if (agreement.employerId.toString() !== userId && user.role !== 'admin') {
            return res.status(403).json({ message: 'Only the employer can approve or reject updates' });
        }

        const workUpdate = await WorkUpdate.findById(updateId);
        if (!workUpdate || workUpdate.agreementId.toString() !== id) {
            return res.status(404).json({ message: 'Work update record not found' });
        }

        workUpdate.employerApproval = action;
        await workUpdate.save();

        // Notify worker
        await createNotification(
            agreement.workerId.toString(),
            action === 'approved' ? 'Progress Approved! ✅' : 'Progress Revision Requested ⚠️',
            `Employer ${action} your progress update (${workUpdate.progress}%).`,
            action === 'approved' ? 'success' : 'warning'
        );

        return res.json({ message: `Work update ${action}`, workUpdate });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing update approval', error: (error as Error).message });
    }
};

// @desc    Mark work as completed
// @route   POST /api/agreements/:id/complete
// @access  Private (Employer)
export const markWorkCompleted = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user._id.toString();

        const agreement = await WorkAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        if (agreement.employerId.toString() !== userId && user.role !== 'admin') {
            return res.status(403).json({ message: 'Only the employer can mark work as completed' });
        }

        if (agreement.status !== 'active') {
            return res.status(400).json({ message: `Cannot complete agreement with status '${agreement.status}'` });
        }

        agreement.status = 'completed';
        agreement.endDate = new Date();
        await agreement.save();

        // Create notification for worker
        await createNotification(
            agreement.workerId.toString(),
            'Work Completed & Approved! 🏆',
            `Employer marked your job contract as COMPLETED! Proceed to receive payment and leave a review.`,
            'success'
        );

        return res.json({ message: 'Work marked as completed successfully', agreement });
    } catch (error) {
        return res.status(500).json({ message: 'Error completing work', error: (error as Error).message });
    }
};
