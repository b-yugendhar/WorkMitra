import { Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer)
export const createJob = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || (user.role !== 'employer' && user.role !== 'admin')) {
            return res.status(403).json({ message: 'Only employers can create jobs' });
        }

        const { title, description, requiredSkills, location, wage, duration } = req.body;

        if (!title || !description || !location || wage === undefined || !duration) {
            return res.status(400).json({ message: 'Please provide all required job fields (title, description, location, wage, duration)' });
        }

        let skillsArray: string[] = [];
        if (Array.isArray(requiredSkills)) {
            skillsArray = requiredSkills.map((s: string) => s.trim()).filter(Boolean);
        } else if (typeof requiredSkills === 'string') {
            skillsArray = requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const job = await Job.create({
            employerId: user._id,
            title: title.trim(),
            description: description.trim(),
            requiredSkills: skillsArray,
            location: location.trim(),
            wage: Number(wage),
            duration: duration.trim(),
            status: 'open',
        });

        const populatedJob = await job.populate('employerId', 'fullName phone email role');
        return res.status(201).json(populatedJob);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating job', error: (error as Error).message });
    }
};

// @desc    Get all jobs (with optional filters)
// @route   GET /api/jobs
// @access  Public / Authenticated
export const getJobs = async (req: Request, res: Response) => {
    try {
        const {
            status,
            skill,
            location,
            search,
            employerId,
            language,
            minWage,
            maxWage,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = '1',
            limit = '10',
        } = req.query;

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = 'open';
        }

        if (employerId) {
            query.employerId = employerId;
        }

        if (location) {
            query.location = new RegExp(String(location).trim(), 'i');
        }

        if (skill) {
            query.requiredSkills = { $in: [new RegExp(String(skill).trim(), 'i')] };
        }

        if (minWage !== undefined || maxWage !== undefined) {
            query.wage = {};
            if (minWage !== undefined && minWage !== '') {
                query.wage.$gte = Number(minWage);
            }
            if (maxWage !== undefined && maxWage !== '') {
                query.wage.$lte = Number(maxWage);
            }
        }

        if (search) {
            const searchRegex = new RegExp(String(search).trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { requiredSkills: { $in: [searchRegex] } },
            ];
        }

        const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 10));
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        const sortField = String(sortBy);
        const sortDirection = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1;
        sortOptions[sortField] = sortDirection;

        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        const jobs = await Job.find(query)
            .populate('employerId', 'fullName phone email role preferredLanguage')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        // Return structured pagination object
        return res.json({
            jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching jobs', error: (error as Error).message });
    }
};

// @desc    Get jobs created by the authenticated employer
// @route   GET /api/jobs/my
// @access  Private (Employer)
export const getMyJobs = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'employer' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const jobs = await Job.find({ employerId: user._id }).sort({ createdAt: -1 });

        // Attach real applicant count to each job
        const jobsWithApplicantCount = await Promise.all(
            jobs.map(async (job) => {
                const applicantCount = await Application.countDocuments({ jobId: job._id });
                return {
                    ...job.toObject(),
                    applicantCount,
                };
            })
        );

        return res.json(jobsWithApplicantCount);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching employer jobs', error: (error as Error).message });
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public / Authenticated
export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id).populate('employerId', 'fullName phone email role');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const applicantCount = await Application.countDocuments({ jobId: id });

        return res.json({
            ...job.toObject(),
            applicantCount,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching job details', error: (error as Error).message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer Owner / Admin)
export const updateJob = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        const { title, description, requiredSkills, location, wage, duration, status } = req.body;

        if (title) job.title = title.trim();
        if (description) job.description = description.trim();
        if (location) job.location = location.trim();
        if (wage !== undefined) job.wage = Number(wage);
        if (duration) job.duration = duration.trim();
        if (status) job.status = status;

        if (requiredSkills !== undefined) {
            if (Array.isArray(requiredSkills)) {
                job.requiredSkills = requiredSkills.map((s: string) => s.trim()).filter(Boolean);
            } else if (typeof requiredSkills === 'string') {
                job.requiredSkills = requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
        }

        const updatedJob = await job.save();
        const populatedJob = await updatedJob.populate('employerId', 'fullName phone email role');

        return res.json(populatedJob);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating job', error: (error as Error).message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer Owner / Admin)
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();
        return res.json({ message: 'Job deleted successfully', id });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting job', error: (error as Error).message });
    }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Worker)
export const applyForJob = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'worker') {
            return res.status(403).json({ message: 'Only workers can apply for jobs' });
        }

        const jobId = req.params.id;
        const workerId = user._id;
        const { coverNote } = req.body;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'open') return res.status(400).json({ message: 'Job is closed and cannot receive new applications' });

        const mockMatchScore = Math.floor(Math.random() * (100 - 50 + 1) + 50);

        const application = await Application.create({
            jobId,
            workerId,
            coverNote: coverNote || 'Interested in this job',
            matchScore: mockMatchScore,
            status: 'applied',
        });

        return res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }
        return res.status(500).json({ message: 'Error applying for job', error: error.message });
    }
};

// @desc    Get applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private (Employer Owner / Admin)
export const getJobApplications = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.employerId.toString() !== user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ jobId })
            .populate('workerId', 'fullName phone email role profileImage')
            .sort({ createdAt: -1 });

        return res.json(applications);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching applications', error: (error as Error).message });
    }
};
