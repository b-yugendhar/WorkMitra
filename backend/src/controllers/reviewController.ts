import { Request, Response } from 'express';
import Review from '../models/Review';
import WorkAgreement from '../models/WorkAgreement';
import WorkerProfile from '../models/WorkerProfile';
import { createNotification } from './notificationController';

// @desc    Create a review for a completed work agreement
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: Request, res: Response) => {
    try {
        const { agreementId, jobId, revieweeId, rating, comment } = req.body;
        // @ts-ignore
        const reviewerId = req.user._id;

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
        }

        if (reviewerId.toString() === revieweeId.toString()) {
            return res.status(400).json({ message: 'You cannot review yourself' });
        }

        // Find completed agreement
        let agreement;
        if (agreementId) {
            agreement = await WorkAgreement.findById(agreementId);
        } else if (jobId) {
            agreement = await WorkAgreement.findOne({
                jobId,
                status: 'completed',
                $or: [
                    { employerId: reviewerId, workerId: revieweeId },
                    { workerId: reviewerId, employerId: revieweeId },
                ],
            });
        }

        if (!agreement || agreement.status !== 'completed') {
            return res.status(400).json({ message: 'Reviews can only be submitted for completed agreements' });
        }

        const isParticipant =
            agreement.workerId.toString() === reviewerId.toString() ||
            agreement.employerId.toString() === reviewerId.toString();

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to review for this contract' });
        }

        // Check if reviewer already reviewed for this agreement
        const existingReview = await Review.findOne({
            jobId: agreement.jobId,
            reviewerId,
            revieweeId,
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this contract' });
        }

        const review = await Review.create({
            jobId: agreement.jobId,
            reviewerId,
            revieweeId,
            rating: ratingNum,
            comment: comment ? comment.trim() : '',
        });

        // Update Trust Score if review is for worker
        // @ts-ignore
        if (req.user.role === 'employer') {
            const profile = await WorkerProfile.findOne({ userId: revieweeId });
            if (profile) {
                profile.totalJobsCompleted += 1;
                const adjust = (ratingNum - 3) * 2;
                profile.trustScore = Math.min(100, Math.max(0, profile.trustScore + adjust));
                await profile.save();
            }
        }

        // Notify reviewee
        await createNotification(
            revieweeId.toString(),
            'New Review Received ⭐',
            `You received a ${ratingNum}-star review for your work.`,
            'info'
        );

        return res.status(201).json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating review', error: (error as Error).message });
    }
};

// @desc    Get reviews given/received by current user
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;

        const receivedReviews = await Review.find({ revieweeId: userId })
            .populate('reviewerId', 'fullName phone role')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        const givenReviews = await Review.find({ reviewerId: userId })
            .populate('revieweeId', 'fullName phone role')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        return res.json({ receivedReviews, givenReviews });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user reviews', error: (error as Error).message });
    }
};

// @desc    Get reviews for a specific user ID
// @route   GET /api/users/:id/reviews
// @access  Public / Authenticated
export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ revieweeId: id })
            .populate('reviewerId', 'fullName phone role')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        return res.json(reviews);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching reviews', error: (error as Error).message });
    }
};
