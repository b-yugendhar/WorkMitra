import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Not authorized. Token missing',
            });
            return;
        }

        const token = authHeader.substring(7).trim();
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({
                message: 'JWT_SECRET is missing in .env',
            });
            return;
        }

        const decoded = jwt.verify(token, secret) as jwt.JwtPayload & {
            id: string;
        };

        if (!decoded.id) {
            res.status(401).json({
                message: 'Invalid token payload',
            });
            return;
        }

        const user = await User.findById(decoded.id).select('-passwordHash');

        if (!user) {
            res.status(401).json({
                message: 'User not found',
            });
            return;
        }

        if (user.status !== 'active') {
            res.status(403).json({
                message: 'Your account is not active',
            });
            return;
        }

        (req as any).user = user;

        next();
    } catch {
        res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
};

export const admin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const user = (req as any).user;

    if (!user) {
        res.status(401).json({
            message: 'Not authenticated',
        });
        return;
    }

    if (user.role !== 'admin') {
        res.status(403).json({
            message: 'Admin access required',
        });
        return;
    }

    next();
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({
                message: 'Not authenticated',
            });
            return;
        }

        if (!roles.includes(user.role)) {
            res.status(403).json({
                message: `Access denied. Role '${user.role}' is not authorized to access this resource`,
            });
            return;
        }

        next();
    };
};