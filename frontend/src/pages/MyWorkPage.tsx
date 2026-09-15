import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const MyWorkPage = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyWork();
    }, []);

    const fetchMyWork = async () => {
        try {
            const response = await api.get('/agreements');
            setTasks(response.data.length ? response.data : getFallbackMockData());
        } catch (error) {
            console.error("API error, falling back to mock", error);
            setTasks(getFallbackMockData());
        } finally {
            setLoading(false);
        }
    };

    const getFallbackMockData = () => [
        { _id: '1', jobId: { title: 'Plumbing Repair at TechPark' }, employerId: { name: 'Apex Builders' }, agreedAmount: '₹1,500', status: 'active' },
        { _id: '2', jobId: { title: 'Pipe Fitting Phase 1' }, employerId: { name: 'Nexus Inc' }, agreedAmount: '₹4,500', status: 'completed' },
        { _id: '3', jobId: { title: 'Warehouse Wiring' }, employerId: { name: 'Smart Build' }, agreedAmount: '₹2,500', status: 'disputed' }
    ];

    const handleMarkComplete = async (id: string) => {
        try {
            // await api.put(`/agreements/${id}/status`, { status: 'completed' });
            setTasks(tasks.map(t => t._id === id ? { ...t, status: 'completed' } : t));
        } catch (error) {
            console.error("Error marking complete", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">My Work</h2>
                <p className="text-slate-500 mt-1">Track your active tasks and mark them as complete.</p>
            </header>

            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading your tasks...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tasks.map((task, idx) => (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        task.status === 'disputed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{task.jobId?.title}</h3>
                                <p className="text-slate-500 font-medium">{task.employerId?.name}</p>

                                <div className="mt-6 flex items-center gap-4 text-slate-600">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-400">Earnings</span>
                                        <span className="font-bold text-slate-800">{task.agreedAmount}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase text-slate-400">Timeline</span>
                                        <span className="font-medium text-slate-600">Ends in 2 days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                                {task.status === 'active' ? (
                                    <button
                                        onClick={() => handleMarkComplete(task._id)}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex justify-center items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Mark Complete
                                    </button>
                                ) : task.status === 'disputed' ? (
                                    <button className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-medium cursor-not-allowed flex justify-center items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> In Dispute Resolution
                                    </button>
                                ) : (
                                    <button className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-medium cursor-not-allowed">
                                        Waiting for Payment
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default MyWorkPage;
