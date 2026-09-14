import { Request, Response } from 'express';
import VerificationRequest from '../models/VerificationRequest';

// @desc    Submit evidence for verification
// @route   POST /api/verify/submit
// @access  Private
export const submitEvidence = async (req: Request, res: Response) => {
    try {
        const { type, fileUrl } = req.body;
        // @ts-ignore
        const userId = req.user._id;

        // Simulate AI Feature: Extract skills from documents
        let extractedData = {};
        let status = 'pending';

        if (type === 'skill_certificate') {
            // TODO (Phase 5 real integration): Call Python service / Vision API here
            // For now, we simulate an AI extracting skills
            extractedData = {
                detectedSkills: ['Plumbing', 'Pipe Fitting'],
                confidenceScore: 0.92,
                issuer: 'National Skill Development Corporation',
            };

            console.log('AI Extraction simulated for certificate upload.');
        } else if (type === 'identity') {
            extractedData = { matchedName: true, docType: 'Aadhaar' };
        }

        const verificationReq = await VerificationRequest.create({
            userId,
            type,
            fileUrl,
            status,
            extractedData,
        });

        res.status(201).json(verificationReq);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting evidence', error: (error as Error).message });
    }
};

// @desc    Admin review evidence
// @route   PUT /api/verify/:id/review
// @access  Private (Admin/Verifier)
export const reviewEvidence = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'admin' && req.user.role !== 'verifier') {
            return res.status(403).json({ message: 'Only admins or verifiers can review evidence' });
        }

        const { status, adminNotes } = req.body;
        const reqId = req.params.id;

        const verificationReq = await VerificationRequest.findById(reqId);
        if (!verificationReq) return res.status(404).json({ message: 'Request not found' });

        verificationReq.status = status;
        verificationReq.adminNotes = adminNotes;
        // @ts-ignore
        verificationReq.reviewedBy = req.user._id;

        await verificationReq.save();

        res.json(verificationReq);
    } catch (error) {
        res.status(500).json({ message: 'Error reviewing evidence', error: (error as Error).message });
    }
};
