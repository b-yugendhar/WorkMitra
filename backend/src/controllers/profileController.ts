import { Request, Response } from 'express';
import User from '../models/User';
import EmployerProfile from '../models/EmployerProfile';
import WorkerProfile from '../models/WorkerProfile';

// @desc    Get current user profile (with role-specific details)
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileDetails = null;
        if (user.role === 'employer') {
            profileDetails = await EmployerProfile.findOne({ userId });
            if (!profileDetails) {
                profileDetails = await EmployerProfile.create({
                    userId,
                    companyName: user.fullName ? `${user.fullName}'s Business` : 'My Company',
                    industry: 'General Services',
                });
            }
        } else if (user.role === 'worker') {
            profileDetails = await WorkerProfile.findOne({ userId });
            if (!profileDetails) {
                profileDetails = await WorkerProfile.create({
                    userId,
                    skills: [],
                    experienceSummary: '',
                    availabilityStatus: 'available',
                });
            }
        }

        res.json({
            user: {
                id: user._id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                status: user.status,
                preferredLanguage: user.preferredLanguage || 'en',
                profileImage: user.profileImage || '',
                createdAt: user.createdAt,
            },
            profile: profileDetails,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile', error: (error as Error).message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const {
            fullName,
            phone,
            email,
            profileImage,
            preferredLanguage,
            // Employer specific
            companyName,
            industry,
            description,
            // Worker specific
            skills,
            experienceSummary,
            locationText,
            expectedWage,
            workType,
            additionalLanguages,
            availabilityStatus,
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Phone validation
        if (phone && phone.trim()) {
            const cleanPhone = phone.trim();
            if (!/^[0-9]{10}$/.test(cleanPhone)) {
                return res.status(400).json({ message: 'Phone number must be a valid 10-digit number' });
            }
            if (cleanPhone !== user.phone) {
                const existingPhone = await User.findOne({ phone: cleanPhone });
                if (existingPhone) {
                    return res.status(400).json({ message: 'Phone number is already registered to another account' });
                }
                user.phone = cleanPhone;
            }
        }

        // Email validation
        if (email !== undefined) {
            const cleanEmail = email ? email.trim().toLowerCase() : '';
            if (cleanEmail) {
                if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
                    return res.status(400).json({ message: 'Invalid email address format' });
                }
                if (cleanEmail !== user.email) {
                    const existingEmail = await User.findOne({ email: cleanEmail });
                    if (existingEmail) {
                        return res.status(400).json({ message: 'Email address is already in use' });
                    }
                    user.email = cleanEmail;
                }
            } else {
                user.email = '';
            }
        }

        if (fullName !== undefined) user.fullName = fullName.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

        // Save User model changes (role is immutable)
        await user.save();

        let updatedProfile = null;
        if (user.role === 'employer') {
            updatedProfile = await EmployerProfile.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        companyName: companyName ? companyName.trim() : 'Independent Employer',
                        industry: industry ? industry.trim() : 'General',
                        location: locationText ? locationText.trim() : '',
                        description: description ? description.trim() : '',
                        preferredLanguage: preferredLanguage || user.preferredLanguage,
                    },
                },
                { new: true, upsert: true }
            );
        } else if (user.role === 'worker') {
            const formattedSkills = Array.isArray(skills)
                ? skills.map((s: string) => s.trim()).filter(Boolean)
                : typeof skills === 'string'
                    ? skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];

            const formattedAdditionalLanguages = Array.isArray(additionalLanguages)
                ? additionalLanguages
                : typeof additionalLanguages === 'string'
                    ? additionalLanguages.split(',').map((l) => l.trim()).filter(Boolean)
                    : [];

            updatedProfile = await WorkerProfile.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        skills: formattedSkills,
                        experienceSummary: experienceSummary ? experienceSummary.trim() : '',
                        locationText: locationText ? locationText.trim() : '',
                        expectedWage: expectedWage !== undefined ? Number(expectedWage) : 0,
                        workType: workType || 'daily-wage',
                        preferredLanguage: preferredLanguage || user.preferredLanguage,
                        additionalLanguages: formattedAdditionalLanguages,
                        availabilityStatus: availabilityStatus || 'available',
                        availability: availabilityStatus !== 'not-available',
                    },
                },
                { new: true, upsert: true }
            );
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                status: user.status,
                preferredLanguage: user.preferredLanguage,
                profileImage: user.profileImage || '',
            },
            profile: updatedProfile,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: (error as Error).message });
    }
};
