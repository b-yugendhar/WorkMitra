import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is missing in .env');
    }

    return jwt.sign(
        { id },
        secret,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        } as jwt.SignOptions
    );
};

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            fullName,
            phone,
            password,
            role,
            email,
            preferredLanguage,
        } = req.body;

        if (!phone || !password) {
            res.status(400).json({
                message: 'Phone number and password are required',
            });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                message: 'Password must contain at least 6 characters',
            });
            return;
        }

        if (role === 'admin') {
            res.status(400).json({
                message: 'Public registration for Admin role is strictly forbidden',
            });
            return;
        }

        const validRole = role === 'employer' ? 'employer' : 'worker';

        const existingUserPhone = await User.findOne({ phone });
        if (existingUserPhone) {
            res.status(409).json({
                message: 'User with this phone number already exists',
            });
            return;
        }

        if (email && email.trim() !== '') {
            const existingUserEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingUserEmail) {
                res.status(409).json({
                    message: 'User with this email address already exists',
                });
                return;
            }
        }

        const user = await User.create({
            fullName: fullName || undefined,
            phone,
            passwordHash: password,
            role: validRole,
            email: email ? email.toLowerCase() : undefined,
            preferredLanguage: preferredLanguage || 'en',
        });

        const token = generateToken(String(user._id));

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: String(user._id),
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                status: user.status,
                preferredLanguage: user.preferredLanguage,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Registration failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const loginUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            res.status(400).json({
                message: 'Phone number and password are required',
            });
            return;
        }

        const user = await User.findOne({ phone });

        if (!user) {
            res.status(401).json({
                message: 'Invalid phone number or password',
            });
            return;
        }

        const passwordMatches = await user.matchPassword(password);

        if (!passwordMatches) {
            res.status(401).json({
                message: 'Invalid phone number or password',
            });
            return;
        }

        if (user.status !== 'active') {
            res.status(403).json({
                message: 'Your account is suspended or inactive. Please contact support.',
            });
            return;
        }

        const token = generateToken(String(user._id));

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: String(user._id),
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role,
                status: user.status,
                preferredLanguage: user.preferredLanguage,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Login failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getUserProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const authenticatedUser = (req as any).user;

        if (!authenticatedUser) {
            res.status(401).json({
                message: 'User not authenticated',
            });
            return;
        }

        const user = await User.findById(authenticatedUser._id).select(
            '-passwordHash'
        );

        if (!user) {
            res.status(404).json({
                message: 'User not found',
            });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Unable to load profile',
        });
    }
};