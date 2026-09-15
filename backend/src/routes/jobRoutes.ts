import express from 'express';
import {
    createJob,
    getJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyForJob,
    getJobApplications,
} from '../controllers/jobController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, authorize('employer', 'admin'), createJob)
    .get(getJobs);

// Note: /my must come before /:id route
router.get('/my', protect, authorize('employer', 'admin'), getMyJobs);

router.route('/:id')
    .get(getJobById)
    .put(protect, authorize('employer', 'admin'), updateJob)
    .delete(protect, authorize('employer', 'admin'), deleteJob);

router.post('/:id/apply', protect, authorize('worker'), applyForJob);
router.get('/:id/applications', protect, authorize('employer', 'admin'), getJobApplications);

export default router;
