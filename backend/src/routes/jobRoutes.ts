import express from 'express';
import { createJob, getJobs, applyForJob, getJobApplications } from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, createJob)
    .get(getJobs);

router.post('/:id/apply', protect, applyForJob);
router.get('/:id/applications', protect, getJobApplications);

export default router;
