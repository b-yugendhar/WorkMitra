import { Request, Response } from 'express';
import WorkAgreement from '../models/WorkAgreement';
import Application from '../models/Application';
import Job from '../models/Job';
import { createNotification } from './notificationController';

// @desc    Create a new work agreement for an accepted application
// @route   POST /api/agreements
// @access  Private (Employer)
export const createAgreement = async (req: Request, res: Response) => {
    try {
        const { jobId, applicationId, workerId, agreedWage, duration, startDate, endDate, terms } = req.body;
        const user = (req as any).user;
        const employerId = user._id;

        if (!jobId || !workerId || agreedWage === undefined || !terms) {
            return res.status(400).json({ message: 'Please provide all required agreement fields (jobId, workerId, agreedWage, terms)' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employerId.toString() !== employerId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create agreement for this job' });
        }

        // Check if application exists and is accepted/applied
        if (applicationId) {
            const application = await Application.findById(applicationId);
            if (application) {
                // Check duplicate agreement for same application
                const existingAgreement = await WorkAgreement.findOne({ applicationId });
                if (existingAgreement) {
                    return res.status(400).json({ message: 'An agreement already exists for this application' });
                }
                // Auto-mark application as accepted/hired if pending
                if (application.status !== 'accepted' && application.status !== 'hired') {
                    application.status = 'hired';
                    await application.save();
                }
            }
        }

        const agreement = await WorkAgreement.create({
            jobId,
            applicationId,
            workerId,
            employerId,
            agreedWage: Number(agreedWage),
            duration: duration || job.duration || '1 Day',
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : undefined,
            terms: terms.trim(),
            status: 'active',
            paymentStatus: 'pending',
        });

        // Create notification for worker
        await createNotification(
            workerId.toString(),
            'Work Agreement Created! 📜',
            `A formal work agreement has been issued for "${job.title}". Agreed Wage: ₹${agreedWage}`,
            'success'
        );

        const populated = await agreement.populate([
            { path: 'workerId', select: 'fullName phone email' },
            { path: 'employerId', select: 'fullName phone email' },
            { path: 'jobId', select: 'title location wage' },
        ]);

        return res.status(201).json(populated);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating agreement', error: (error as Error).message });
    }
};

// @desc    Get employer agreements
// @route   GET /api/agreements/employer
// @access  Private (Employer)
export const getEmployerAgreements = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const employerId = user._id;

        const agreements = await WorkAgreement.find({ employerId })
            .populate('workerId', 'fullName phone email profileImage')
            .populate('jobId', 'title location wage')
            .sort({ createdAt: -1 });

        return res.json(agreements);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching employer agreements', error: (error as Error).message });
    }
};

// @desc    Get user agreements (worker or employer)
// @route   GET /api/agreements
// @access  Private
export const getMyAgreements = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user._id;
        const userRole = user.role;

        let agreements;
        if (userRole === 'employer') {
            agreements = await WorkAgreement.find({ employerId: userId })
                .populate('workerId', 'fullName phone email')
                .populate('jobId', 'title location wage')
                .sort({ createdAt: -1 });
        } else if (userRole === 'worker') {
            agreements = await WorkAgreement.find({ workerId: userId })
                .populate('employerId', 'fullName phone email')
                .populate('jobId', 'title location wage')
                .sort({ createdAt: -1 });
        } else {
            agreements = await WorkAgreement.find()
                .populate('workerId', 'fullName phone')
                .populate('employerId', 'fullName phone')
                .populate('jobId', 'title')
                .sort({ createdAt: -1 });
        }

        return res.json(agreements);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching agreements', error: (error as Error).message });
    }
};

// @desc    Get single agreement by ID
// @route   GET /api/agreements/:id
// @access  Private
export const getAgreementById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user._id.toString();
        const userRole = user.role;

        const agreement = await WorkAgreement.findById(id)
            .populate('workerId', 'fullName phone email profileImage')
            .populate('employerId', 'fullName phone email profileImage')
            .populate('jobId', 'title description location wage duration requiredSkills');

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        const isParticipant =
            agreement.workerId._id.toString() === userId ||
            agreement.employerId._id.toString() === userId ||
            userRole === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view this agreement' });
        }

        return res.json(agreement);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching agreement details', error: (error as Error).message });
    }
};

// @desc    Update agreement status
// @route   PUT /api/agreements/:id/status
// @access  Private
export const updateAgreementStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const user = (req as any).user;
        const agreement = await WorkAgreement.findById(req.params.id).populate('jobId');

        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        const userId = user._id.toString();
        const isWorker = agreement.workerId.toString() === userId;
        const isEmployer = agreement.employerId.toString() === userId;
        const isAdmin = user.role === 'admin';

        if (!isWorker && !isEmployer && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to modify this agreement' });
        }

        agreement.status = status;
        await agreement.save();

        const notifyTarget = isEmployer ? agreement.workerId.toString() : agreement.employerId.toString();
        const jobTitle = (agreement.jobId as any)?.title || 'Work Contract';

        await createNotification(
            notifyTarget,
            'Agreement Status Updated',
            `The status of contract for "${jobTitle}" has been set to ${status.toUpperCase()}.`,
            'info'
        );

        return res.json(agreement);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating status', error: (error as Error).message });
    }
};
