import { Request, Response } from "express";
import User from "../models/User";

// Get platform statistics
export const getPlatformStats = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();
        const workers = await User.countDocuments({
            role: "worker",
        });
        const employers = await User.countDocuments({
            role: "employer",
        });
        const admins = await User.countDocuments({
            role: "admin",
        });
        const verifiers = await User.countDocuments({
            role: "verifier",
        });

        res.status(200).json({
            totalUsers,
            workers,
            employers,
            admins,
            verifiers,
        });
    } catch (error) {
        res.status(500).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to fetch platform statistics",
        });
    }
};

// Get disputes
export const getDisputes = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Temporary response until a Dispute model is added
        res.status(200).json({
            message: "Dispute management is not implemented yet",
            disputes: [],
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch disputes",
        });
    }
};

// Resolve dispute
export const resolveDispute = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { disputeId } = req.params;

        res.status(200).json({
            message: "Dispute resolution endpoint is ready",
            disputeId,
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to resolve dispute",
        });
    }
};