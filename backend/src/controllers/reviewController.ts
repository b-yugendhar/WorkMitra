import { Request, Response } from 'express';
import Review from '../models/Review';
import WorkAgreement from '../models/WorkAgreement';
import WorkerProfile from '../models/WorkerProfile';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response) => {
    try {
        const { jobId, revieweeId, rating, comment } = req.body;
        // @ts-ignore
        const reviewerId = req.user._id;

        // Check if an agreement exists and is completed
        const agreement = await WorkAgreement.findOne({
            jobId,
            status: 'completed',
            $or: [
                { employerId: reviewerId, workerId: revieweeId },
                { workerId: reviewerId, employerId: revieweeId }
            ]
        });

        if (!agreement) {
            return res.status(400).json({ message: 'Cannot review without a completed work agreement' });
        }

        const existingReview = await Review.findOne({ jobId, reviewerId, revieweeId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted for this job' });
        }

        const review = await Review.create({
            jobId,
            reviewerId,
            revieweeId,
            rating,
            comment
        });

        // Optionally update WorkerProfile trustScore if the review is for a worker
        // @ts-ignore
        if (req.user.role === 'employer') {
            const profile = await WorkerProfile.findOne({ userId: revieweeId });
            if (profile) {
                profile.totalJobsCompleted += 1;
                // Simple adjust trust score logic (add up to +5 depending on rating)
                const adjust = (rating - 3) * 2; // e.g. 5 stars -> +4, 1 star -> -4
                profile.trustScore = Math.min(100, Math.max(0, profile.trustScore + adjust));
                await profile.save();
            }
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: (error as Error).message });
    }
};

// @desc    Get user reviews
// @route   GET /api/reviews/:userId
// @access  Public
export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find({ revieweeId: req.params.userId })
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: (error as Error).message });
    }
};
