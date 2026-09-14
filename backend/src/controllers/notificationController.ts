import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: (error as Error).message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { readStatus: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: (error as Error).message });
    }
};

export const createNotification = async (userId: string, title: string, message: string, type = 'info') => {
    try {
        await Notification.create({ userId, title, message, type });
        // Future: trigger websockets or push services here
    } catch (error) {
        console.error('Failed to create notification', error);
    }
};
