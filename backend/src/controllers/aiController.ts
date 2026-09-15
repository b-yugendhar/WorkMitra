import { Request, Response } from 'express';
import User from '../models/User';
import WorkerProfile from '../models/WorkerProfile';
import Job from '../models/Job';
import Application from '../models/Application';
import WorkAgreement from '../models/WorkAgreement';
import Dispute from '../models/Dispute';
import VerificationRequest from '../models/VerificationRequest';
import RiskLog from '../models/RiskLog';

import { matchSkills } from '../services/aiSkillMatchingService';
import { translateText, SUPPORTED_LANGUAGES } from '../services/translationService';
import { parseVoiceCommand } from '../services/voiceParsingService';
import { logAIOperation } from '../services/aiAuditService';

// @desc    AI Job Recommendations for Worker
// @route   GET /api/ai/recommendations/jobs
// @access  Private (Worker)
export const getJobRecommendations = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        // @ts-ignore
        const userId = req.user._id;

        const workerUser = await User.findById(userId);
        if (!workerUser) return res.status(404).json({ message: 'User not found' });

        const workerProfile = await WorkerProfile.findOne({ userId });

        // 1. Fetch jobs worker already applied to
        const existingApps = await Application.find({ workerId: userId }).select('jobId');
        const appliedJobIds = existingApps.map((a) => a.jobId.toString());

        // 2. Fetch all open jobs
        const openJobs = await Job.find({ status: 'open', _id: { $nin: appliedJobIds } })
            .populate('employerId', 'fullName phone email')
            .sort({ createdAt: -1 });

        const workerSkills = workerProfile?.skills || [];
        const workerLoc = (workerProfile?.locationText || '').toLowerCase();
        const workerLang = workerUser.preferredLanguage || 'en';
        const expectedWage = workerProfile?.expectedWage || 0;

        // 3. Compute match score for each job
        const recommendations = openJobs.map((job) => {
            const skillMatch = matchSkills(workerSkills, job.requiredSkills || []);
            const jobLoc = (job.location || '').toLowerCase();

            let locationScore = 0;
            if (workerLoc && jobLoc && (workerLoc.includes(jobLoc) || jobLoc.includes(workerLoc))) {
                locationScore = 100;
            } else if (!workerLoc || !jobLoc) {
                locationScore = 50;
            }

            let wageScore = 100;
            if (expectedWage > 0 && job.wage > 0) {
                if (job.wage >= expectedWage) {
                    wageScore = 100;
                } else {
                    wageScore = Math.max(20, Math.round((job.wage / expectedWage) * 100));
                }
            }

            const totalScore = Math.round(
                skillMatch.matchScore * 0.5 + locationScore * 0.3 + wageScore * 0.2
            );

            const reasons: string[] = [];
            if (skillMatch.matchScore > 70) reasons.push(`High skill match (${skillMatch.matchedSkills.join(', ')})`);
            if (locationScore === 100) reasons.push(`Located in preferred area (${job.location})`);
            if (wageScore === 100 && job.wage > 0) reasons.push(`Wage ₹${job.wage} meets or exceeds expected ₹${expectedWage}`);

            return {
                job,
                matchScore: totalScore,
                matchedSkills: skillMatch.matchedSkills,
                matchedLanguages: [workerLang],
                reasons: reasons.length > 0 ? reasons : ['Open opportunity matching general profile'],
                missingSkills: skillMatch.missingSkills,
            };
        });

        // 4. Sort by matchScore descending
        recommendations.sort((a, b) => b.matchScore - a.matchScore);

        // Pagination
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 6;
        const startIndex = (page - 1) * limit;
        const paginatedRecommendations = recommendations.slice(startIndex, startIndex + limit);

        await logAIOperation({
            userId: userId.toString(),
            featureName: 'job_recommendations',
            status: 'success',
            processingDurationMs: Date.now() - startTime,
            metadata: { totalEvaluated: openJobs.length, returnedCount: paginatedRecommendations.length },
        });

        return res.json({
            success: true,
            totalCount: recommendations.length,
            page,
            totalPages: Math.ceil(recommendations.length / limit) || 1,
            recommendations: paginatedRecommendations,
        });
    } catch (error) {
        await logAIOperation({
            featureName: 'job_recommendations',
            status: 'fallback',
            processingDurationMs: Date.now() - startTime,
            metadata: { error: (error as Error).message },
        });
        return res.status(500).json({ message: 'Error generating recommendations', error: (error as Error).message });
    }
};

// @desc    Employer AI Applicant Ranking
// @route   GET /api/ai/jobs/:jobId/applicant-ranking
// @access  Private (Employer / Admin)
export const getApplicantRanking = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        const { jobId } = req.params;
        // @ts-ignore
        const user = req.user;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employerId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Only job owner or admin can access applicant ranking' });
        }

        const applications = await Application.find({ jobId }).populate('workerId', 'fullName phone email preferredLanguage');

        const rankings = await Promise.all(
            applications.map(async (app) => {
                const workerId = app.workerId._id;
                const profile = await WorkerProfile.findOne({ userId: workerId });
                const verifications = await VerificationRequest.find({ userId: workerId, status: 'approved' });

                const workerSkills = profile?.skills || [];
                const skillMatch = matchSkills(workerSkills, job.requiredSkills || []);

                const trustScore = profile?.trustScore || 50;
                const totalJobsCompleted = profile?.totalJobsCompleted || 0;
                const verifiedSkillsCount = verifications.length;

                const overallScore = Math.min(
                    100,
                    Math.round(skillMatch.matchScore * 0.5 + trustScore * 0.3 + Math.min(20, totalJobsCompleted * 2 + verifiedSkillsCount * 5))
                );

                const strengths: string[] = [];
                if (skillMatch.matchScore >= 80) strengths.push('Strong skill match for job requirements');
                if (trustScore >= 80) strengths.push(`High Trust Score (${trustScore}/100)`);
                if (verifiedSkillsCount > 0) strengths.push(`${verifiedSkillsCount} verified document credential(s)`);
                if (totalJobsCompleted > 3) strengths.push(`Experienced worker (${totalJobsCompleted} jobs completed)`);

                let recommendation: 'top_match' | 'potential_match' | 'review' = 'review';
                if (overallScore >= 80) recommendation = 'top_match';
                else if (overallScore >= 60) recommendation = 'potential_match';

                return {
                    applicationId: app._id,
                    worker: app.workerId,
                    profile,
                    matchScore: overallScore,
                    strengths: strengths.length > 0 ? strengths : ['Basic profile candidate'],
                    missingRequirements: skillMatch.missingSkills,
                    explanation: skillMatch.explanation,
                    recommendation,
                    appliedAt: (app as any).createdAt || new Date(),
                };
            })
        );

        rankings.sort((a, b) => b.matchScore - a.matchScore);

        await logAIOperation({
            userId: user._id.toString(),
            featureName: 'applicant_ranking',
            relatedEntityId: String(jobId),
            status: 'success',
            processingDurationMs: Date.now() - startTime,
            metadata: { totalApplicants: rankings.length },
        });

        return res.json({ success: true, rankings });
    } catch (error) {
        return res.status(500).json({ message: 'Error ranking applicants', error: (error as Error).message });
    }
};

// @desc    Multilingual AI Translation
// @route   POST /api/ai/translate
// @access  Public / Authenticated
export const translateContent = async (req: Request, res: Response) => {
    try {
        const { text, sourceLanguage = 'en', targetLanguage = 'en', context = 'general' } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text to translate is required' });
        }

        const result = await translateText(text, sourceLanguage, targetLanguage, context);

        return res.json({
            translatedText: result.translatedText,
            sourceLanguage,
            targetLanguage,
            cached: result.cached,
            isAI: result.isAI,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Translation failed', error: (error as Error).message });
    }
};

// @desc    AI Risk & Anomaly Detection
// @route   POST /api/ai/risk-analysis
// @access  Private
export const analyzeRisk = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        const { targetType, targetId, text, wage } = req.body;
        // @ts-ignore
        const userId = req.user?._id;

        const lowerText = (text || '').toLowerCase();
        const riskFlags: string[] = [];
        let riskScore = 0;

        // Suspicious payment keywords check
        const feePatterns = [
            'registration fee',
            'upfront payment',
            'pay deposit',
            'telegram',
            'gpay upfront',
            'whatsapp money',
            'processing fee',
        ];

        feePatterns.forEach((pattern) => {
            if (lowerText.includes(pattern)) {
                riskFlags.push(`Suspicious fee / off-platform contact keyword detected: "${pattern}"`);
                riskScore += 45;
            }
        });

        // Wage anomaly check
        if (wage !== undefined && wage !== null) {
            const wageNum = Number(wage);
            if (wageNum > 50000) {
                riskFlags.push(`Unusually high wage (₹${wageNum}/day) flagged for manual review.`);
                riskScore += 35;
            } else if (wageNum === 0) {
                riskFlags.push('Zero wage listed for work posting.');
                riskScore += 20;
            }
        }

        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskScore >= 70) riskLevel = 'critical';
        else if (riskScore >= 40) riskLevel = 'high';
        else if (riskScore >= 20) riskLevel = 'medium';

        const requiresHumanReview = riskLevel === 'high' || riskLevel === 'critical';
        const explanation =
            riskFlags.length > 0
                ? `Automated Risk Flags: ${riskFlags.join(' | ')}`
                : 'No anomaly or risk patterns detected. Content clean.';

        // Record in RiskLog schema
        const riskRecord = await RiskLog.create({
            targetType: targetType || 'job',
            targetId: targetId || 'draft',
            riskLevel,
            riskScore,
            riskFlags,
            explanation,
            requiresHumanReview,
            status: requiresHumanReview ? 'flagged' : 'clear',
        });

        await logAIOperation({
            userId: userId ? userId.toString() : undefined,
            featureName: 'risk_analysis',
            relatedEntityId: targetId,
            status: 'success',
            requiresHumanReview,
            processingDurationMs: Date.now() - startTime,
        });

        return res.json({
            riskLevel,
            riskScore,
            riskFlags,
            explanation,
            requiresHumanReview,
            riskLogId: riskRecord._id,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Risk analysis error', error: (error as Error).message });
    }
};

// @desc    AI Dispute Summarization
// @route   GET /api/ai/disputes/:disputeId/summary
// @access  Private
export const getDisputeSummary = async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        const { disputeId } = req.params;
        // @ts-ignore
        const user = req.user;

        const dispute = await Dispute.findById(disputeId)
            .populate('raisedBy', 'fullName phone role')
            .populate('againstUser', 'fullName phone role')
            .populate({
                path: 'agreementId',
                populate: { path: 'jobId', select: 'title wage location description' },
            });

        if (!dispute) return res.status(404).json({ message: 'Dispute record not found' });

        // @ts-ignore
        const agreement: any = dispute.agreementId;
        const raisedBy: any = dispute.raisedBy;
        const againstUser: any = dispute.againstUser;
        const disputeIdStr = String(disputeId || '');

        const isParticipant =
            raisedBy?._id?.toString() === user._id.toString() ||
            againstUser?._id?.toString() === user._id.toString() ||
            user.role === 'admin';

        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to view dispute summary' });
        }

        const timeline = [
            `Contract Created for "${agreement?.jobId?.title || 'Work'}" at agreed wage ₹${agreement?.agreedWage || 0}`,
            `Dispute Filed by ${raisedBy?.fullName} (${raisedBy?.role}) on ${new Date(dispute.createdAt).toLocaleDateString()}`,
            `Current Status: ${dispute.status.toUpperCase()}`,
        ];

        const workerClaims = raisedBy?.role === 'worker' ? [dispute.description] : ['Awaiting worker statement.'];
        const employerClaims = raisedBy?.role === 'employer' ? [dispute.description] : ['Awaiting employer counter-statement.'];

        const evidenceSummary =
            dispute.evidence && dispute.evidence.length > 0
                ? [`${dispute.evidence.length} evidence attachment(s) submitted for verification.`]
                : ['No initial evidence files attached.'];

        const missingInformation: string[] = [];
        if (!dispute.evidence || dispute.evidence.length === 0) missingInformation.push('Photo or daily work updates proof');
        if (dispute.status === 'open') missingInformation.push('Formal response from counterparty');

        const suggestedQuestions = [
            'Did the worker complete all milestone tasks specified in the agreement?',
            'Was payment transferred outside the WorkMitra escrow platform?',
            'Are photos or work logs available for the disputed dates?',
        ];

        await logAIOperation({
            userId: user._id.toString(),
            featureName: 'dispute_summary',
            relatedEntityId: disputeIdStr,
            status: 'success',
            requiresHumanReview: true,
            processingDurationMs: Date.now() - startTime,
        });

        return res.json({
            summary: `Dispute Case #${disputeIdStr.slice(-6)}: "${dispute.reason}". Raised by ${raisedBy?.fullName} regarding contract "${agreement?.jobId?.title || 'Job'}".`,
            timeline,
            workerClaims,
            employerClaims,
            evidenceSummary,
            missingInformation,
            suggestedQuestions,
            recommendation: 'human_review_required',
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error generating dispute summary', error: (error as Error).message });
    }
};

// @desc    AI Help & Support Assistant
// @route   POST /api/ai/support
// @access  Public / Authenticated
export const supportAssistant = async (req: Request, res: Response) => {
    try {
        const { message, language = 'en' } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const lowerMsg = message.toLowerCase();
        let answer = '';
        let category = 'general';
        let requiresHumanSupport = false;

        if (lowerMsg.includes('register') || lowerMsg.includes('sign up') || lowerMsg.includes('account')) {
            category = 'account';
            answer = 'To register on WorkMitra, select "Register" on the login page, choose whether you are a Worker or Employer, enter your phone number and full name, and set a secure password.';
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('money') || lowerMsg.includes('escrow') || lowerMsg.includes('wage')) {
            category = 'payments';
            answer = 'WorkMitra uses an Escrow system. When an employer creates an agreement, compensation is held securely and released directly to the worker once work completion is confirmed.';
        } else if (lowerMsg.includes('dispute') || lowerMsg.includes('problem') || lowerMsg.includes('cheated')) {
            category = 'disputes';
            requiresHumanSupport = true;
            answer = 'If you experience wage non-payment or contract breach, navigate to "Dispute Protection" in your sidebar, select your work contract, and file an official report. WorkMitra admins will review your evidence.';
        } else if (lowerMsg.includes('job') || lowerMsg.includes('apply') || lowerMsg.includes('work')) {
            category = 'jobs';
            answer = 'Browse "Available Jobs" or check "AI Recommendations" to discover jobs matching your skills and location. Click "Apply Now" to submit your application directly to employers.';
        } else {
            answer = 'WorkMitra connects verified skilled workers with local daily-wage and contract job opportunities safely using Escrow payments and multi-language support. How can I assist your work search today?';
        }

        // Translate answer if language is not English
        if (language && language !== 'en' && SUPPORTED_LANGUAGES.includes(language as any)) {
            const translatedRes = await translateText(answer, 'en', language, 'support_answer');
            answer = translatedRes.translatedText;
        }

        return res.json({
            answer,
            category,
            requiresHumanSupport,
            disclaimer: 'Notice: This assistant provides general guidance. Critical dispute or payment actions are handled by WorkMitra human verifiers.',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Support assistant error', error: (error as Error).message });
    }
};

// @desc    AI Voice Parser
// @route   POST /api/ai/voice-parse
// @access  Public / Authenticated
export const parseVoice = async (req: Request, res: Response) => {
    try {
        const { rawText } = req.body;
        const parsed = parseVoiceCommand(rawText || '');
        return res.json({ success: true, filters: parsed });
    } catch (error) {
        return res.status(500).json({ message: 'Voice parsing error', error: (error as Error).message });
    }
};
