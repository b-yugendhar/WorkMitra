import { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { createNotification } from './notificationController';

// @desc    Update application status (accept or reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer Owner)
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        const { status } = req.body; // 'accepted' | 'rejected' | 'pending' | 'hired'

        if (!['accepted', 'rejected', 'pending', 'hired'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be accepted, rejected, pending, or hired.' });
        }

        const application =await Application.findById(id).populate('jobId');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const job = application.jobId as any;
        if (!job) {
            return res.status(404).json({ message: 'Associated job not found' });
        }

        // Verify employer ownership of job
        if (job.employerId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to manage applications for this job' });
        }

        // Closed job protection rule
        if (job.status === 'closed' && status === 'accepted') {
            return res.status(400).json({ message: 'Cannot accept applications for a closed job' });
        }

        application.status = status as any;
        await application.save();

        // Create automated notification for worker
        const workerId = application.workerId.toString();
        const notifyTitle = status === 'accepted' ? 'Application Accepted! 🎉' : 'Application Update';
        const notifyMsg = status === 'accepted'
            ? `Your application for "${job.title}" has been ACCEPTED by the employer!`
            : `Your application for "${job.title}" status was updated to ${status.toUpperCase()}.`;

        await createNotification(
            workerId,
            notifyTitle,
            notifyMsg,
            status === 'accepted' ? 'success' : 'info'
        );

        return res.json({ message: `Application status updated to ${status}`, application });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update application status', error: (error as Error).message });
    }
};

// @desc    Get user applications
// @route   GET /api/applications/my
// @access  Private
export const getMyApplications = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let applications;

        if (user.role === 'worker') {
            applications = await Application.find({ workerId: user._id })
                .populate({
                    path: 'jobId',
                    populate: { path: 'employerId', select: 'fullName phone email' }
                })
                .sort({ createdAt: -1 });
        } else if (user.role === 'employer') {
            const employerJobs = await Job.find({ employerId: user._id }).select('_id');
            const jobIds = employerJobs.map((j) => j._id);
            applications = await Application.find({ jobId: { $in: jobIds } })
                .populate('workerId', 'fullName phone email profileImage')
                .populate('jobId', 'title location wage')
                .sort({ createdAt: -1 });
        } else {
            applications = await Application.find()
                .populate('workerId', 'fullName phone email')
                .populate('jobId', 'title')
                .sort({ createdAt: -1 });
        }

        return res.json(applications);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch applications', error: (error as Error).message });
    }
};
