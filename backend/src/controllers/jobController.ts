import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import mongoose from 'mongoose';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer)
export const createJob = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'employer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only employers can create jobs' });
        }

        const jobData = {
            ...req.body,
            // @ts-ignore
            employerId: req.user._id,
        };

        const job = await Job.create(jobData);
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: (error as Error).message });
    }
};

// @desc    Get all jobs (with optional filters)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req: Request, res: Response) => {
    try {
        const { status, skill, lng, lat, distance } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (skill) query.requiredSkills = { $in: [skill] };

        if (lng && lat && distance) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
                    },
                    $maxDistance: parseInt(distance as string),
                },
            };
        }

        const jobs = await Job.find(query).populate('employerId', 'phone role').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: (error as Error).message });
    }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Worker)
export const applyForJob = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'worker') {
            return res.status(403).json({ message: 'Only workers can apply for jobs' });
        }

        const jobId = req.params.id;
        // @ts-ignore
        const workerId = req.user._id;
        const { coverNote } = req.body;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for applications' });

        // Mock AI match score (0-100)
        // ToDo Phase 4 AI step: Integrate Python service or Gemini API to calculate real match based on WorkerProfile
        const mockMatchScore = Math.floor(Math.random() * (100 - 50 + 1) + 50);

        const application = await Application.create({
            jobId,
            workerId,
            coverNote,
            matchScore: mockMatchScore,
        });

        res.status(201).json(application);
    } catch (error) {
        // Handle uniqueness duplicate error gracefully
        if ((error as any).code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        res.status(500).json({ message: 'Error applying for job', error: (error as Error).message });
    }
};

// @desc    Get applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private (Employer)
export const getJobApplications = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // @ts-ignore
        if (job.employerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ jobId })
            .populate('workerId', 'phone email')
            .sort({ matchScore: -1 }); // Sort by AI match score by default

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: (error as Error).message });
    }
};
