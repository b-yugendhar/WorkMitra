import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import WorkAgreement from '../models/WorkAgreement';
import WorkUpdate from '../models/WorkUpdate';
import Payment from '../models/Payment';
import Dispute from '../models/Dispute';

export const getEmployerDashboardStats = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const employerId = req.user._id;

        // 1. Jobs count
        const totalJobs = await Job.countDocuments({ employerId });
        const openJobs = await Job.countDocuments({ employerId, status: 'open' });
        const closedJobs = await Job.countDocuments({ employerId, status: 'closed' });

        // Get list of job IDs owned by employer
        const employerJobs = await Job.find({ employerId }).select('_id');
        const jobIds = employerJobs.map((j) => j._id);

        // 2. Applicants count
        const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
        const pendingApplications = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: { $in: ['applied', 'pending', 'reviewed', 'shortlisted'] },
        });
        const acceptedWorkers = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: { $in: ['hired', 'accepted'] },
        });

        // 3. Work Agreements count
        const activeAgreements = await WorkAgreement.countDocuments({ employerId, status: 'active' });
        const completedJobs = await WorkAgreement.countDocuments({ employerId, status: 'completed' });

        // 4. Pending Work Approvals
        const pendingWorkApprovals = await WorkUpdate.countDocuments({
            employerId,
            employerApproval: 'pending',
        });

        // 5. Pending Payments
        const pendingPayments = await Payment.countDocuments({
            employerId,
            status: 'pending',
        });

        // 6. Open Disputes
        const openDisputes = await Dispute.countDocuments({
            $or: [{ raisedBy: employerId }, { againstUser: employerId }],
            status: { $in: ['open', 'under_review'] },
        });

        res.json({
            totalJobs,
            openJobs,
            closedJobs,
            totalApplicants,
            pendingApplications,
            acceptedWorkers,
            activeAgreements,
            completedJobs,
            pendingWorkApprovals,
            pendingPayments,
            openDisputes,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch employer dashboard metrics',
            error: (error as Error).message,
        });
    }
};
