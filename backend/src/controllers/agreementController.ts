import { Request, Response } from 'express';
import WorkAgreement from '../models/WorkAgreement';
import Payment from '../models/Payment';
import Job from '../models/Job';

// @desc    Create a new work agreement
// @route   POST /api/agreements
// @access  Private (Employer)
export const createAgreement = async (req: Request, res: Response) => {
    try {
        const { jobId, workerId, terms, agreedAmount } = req.body;
        // @ts-ignore
        const employerId = req.user._id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Ensure the person creating agreement is the employer of the job
        if (job.employerId.toString() !== employerId.toString()) {
            return res.status(403).json({ message: 'Not authorized to create agreement for this job' });
        }

        const agreement = await WorkAgreement.create({
            jobId,
            workerId,
            employerId,
            terms,
            agreedAmount
        });

        res.status(201).json(agreement);
    } catch (error) {
        res.status(500).json({ message: 'Error creating agreement', error: (error as Error).message });
    }
};

// @desc    Get user agreements (worker or employer)
// @route   GET /api/agreements
// @access  Private
export const getMyAgreements = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        // @ts-ignore
        const userRole = req.user.role;

        let agreements;
        if (userRole === 'employer') {
            agreements = await WorkAgreement.find({ employerId: userId }).populate('workerId', 'phone name').populate('jobId', 'title');
        } else if (userRole === 'worker') {
            agreements = await WorkAgreement.find({ workerId: userId }).populate('employerId', 'phone name').populate('jobId', 'title');
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(agreements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agreements', error: (error as Error).message });
    }
};

// @desc    Update agreement status
// @route   PUT /api/agreements/:id/status
// @access  Private
export const updateAgreementStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const agreement = await WorkAgreement.findById(req.params.id);

        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        // @ts-ignore
        const userId = req.user._id.toString();
        const isWorker = agreement.workerId.toString() === userId;
        const isEmployer = agreement.employerId.toString() === userId;

        if (!isWorker && !isEmployer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Add rules: e.g., only employer can mark 'completed' with payment, or worker marks 'completed' as request.
        // For simplicity, we just allow the status to change
        agreement.status = status;
        await agreement.save();

        res.json(agreement);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: (error as Error).message });
    }
};

// @desc    Process mockup payment (Escrow or Released)
// @route   POST /api/agreements/:id/pay
// @access  Private (Employer)
export const processPayment = async (req: Request, res: Response) => {
    try {
        const agreementId = req.params.id;
        // @ts-ignore
        const userId = req.user._id.toString();

        const agreement = await WorkAgreement.findById(agreementId);
        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        if (agreement.employerId.toString() !== userId) {
            return res.status(403).json({ message: 'Only the employer can make payment' });
        }

        const { paymentAction } = req.body; // 'escrow' or 'released'

        const payment = await Payment.create({
            agreementId: agreement._id,
            amount: agreement.agreedAmount,
            status: 'successful'
        });

        agreement.paymentStatus = paymentAction;
        if (paymentAction === 'released') {
            agreement.status = 'completed';
        }
        await agreement.save();

        res.json({ agreement, payment });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error: (error as Error).message });
    }
};
