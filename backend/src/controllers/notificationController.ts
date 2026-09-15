import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: (error as Error).message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { readStatus: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: (error as Error).message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;

        await Notification.updateMany({ userId, readStatus: false }, { readStatus: true });

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error: (error as Error).message });
    }
};

export const createNotification = async (userId: string, title: string, message: string, type = 'info') => {
    try {
        await Notification.create({ userId, title, message, type });
    } catch (error) {
        console.error('Failed to create notification', error);
    }
};
