import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Generate JWT token
const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { phone, password, role, email, preferredLanguage } = req.body;

        const userExists = await User.findOne({ phone });

        if (userExists) {
            return res.status(400).json({ message: 'User with this phone number already exists' });
        }

        const user = await User.create({
            phone,
            passwordHash: password, // Will be hashed by pre-save hook
            role,
            email,
            preferredLanguage,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id as string),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id as string),
            });
        } else {
            res.status(401).json({ message: 'Invalid phone number or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
    // @ts-ignore - Ignore temporarily until middleware types are defined
    const user = await User.findById(req.user._id).select('-passwordHash');

    if (user) {
        res.json(user);
    } else {
        res.status(444).json({ message: 'User not found' });
    }
};
