import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getJobRecommendations,
    getApplicantRanking,
    translateContent,
    analyzeRisk,
    getDisputeSummary,
    supportAssistant,
    parseVoice,
} from '../controllers/aiController';

const router = express.Router();

// AI Recommendations (Private Worker)
router.get('/recommendations/jobs', protect, getJobRecommendations);

// Employer Applicant Ranking (Private Employer / Admin)
router.get('/jobs/:jobId/applicant-ranking', protect, getApplicantRanking);

// Translation (Public / Private)
router.post('/translate', translateContent);

// Risk & Anomaly Detection (Private)
router.post('/risk-analysis', protect, analyzeRisk);

// Dispute Summary (Private)
router.get('/disputes/:disputeId/summary', protect, getDisputeSummary);

// AI Support Assistant (Public / Private)
router.post('/support', supportAssistant);

// Voice Command Parser (Public / Private)
router.post('/voice-parse', parseVoice);

export default router;
