import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.readStatus).length;

    useEffect(() => {
        // fetchNotifications(); // uncomment when auth works perfectly
        // Use Mock for now:
        setNotifications([
            { _id: 'n1', title: 'Payment Released', message: 'Apex Builders released your escrow payment of ₹1,500.', readStatus: false, type: 'success', createdAt: new Date().toISOString() },
            { _id: 'n2', title: 'New Job Match', message: 'You have a 95% match for a Pipe Fitting job.', readStatus: true, type: 'info', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ]);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            // await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, readStatus: true } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors rounded-full hover:bg-slate-100"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                    >
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="font-bold text-slate-800">Notifications</h4>
                            <button className="text-xs text-blue-600 font-medium hover:underline">Mark all read</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No new notifications</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map(n => (
                                        <div
                                            key={n._id}
                                            className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!n.readStatus ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => markAsRead(n._id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className={`text-sm tracking-wide ${!n.readStatus ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'}`}>{n.title}</h5>
                                                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                                {!n.readStatus && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
