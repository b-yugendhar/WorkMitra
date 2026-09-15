import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, Clock, Plus, Trash2, Eye, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JobItem {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    location: string;
    wage: number;
    duration: string;
    status: 'open' | 'closed' | 'in_progress';
    createdAt: string;
}

const EmployerManageJobsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [jobs, setJobs] = useState<JobItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const fetchEmployerJobs = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            if (!user?.id) return;
            const res = await api.get<JobItem[]>(`/jobs?employerId=${user.id}&status=all`);
            setJobs(res.data);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to load your posted jobs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployerJobs();
    }, [user?.id]);

    const handleToggleStatus = async (jobId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
        try {
            await api.put(`/jobs/${jobId}`, { status: nextStatus });
            setJobs((prev) =>
                prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
            );
            setActionMessage(`Job status updated to ${nextStatus.toUpperCase()}`);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to update job status');
        }
    };

    const handleDeleteJob = async (jobId: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the job "${title}"?`)) return;

        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs((prev) => prev.filter((j) => j._id !== jobId));
            setActionMessage(`Job "${title}" deleted successfully`);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to delete job');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">My Posted Jobs</h1>
                    <p className="text-slate-500 mt-1">Manage active listings, edit requirements, or close finished contracts</p>
                </div>

                <button
                    onClick={() => navigate('/employer/create-job')}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Post New Job
                </button>
            </div>

            {errorMessage && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {actionMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl flex items-center gap-3 font-semibold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{actionMessage}</span>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
                    <p className="font-medium">Loading your job listings...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl max-w-lg mx-auto my-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Jobs Posted Yet</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Start hiring verified skilled labor by creating your first job posting today.
                    </p>
                    <button
                        onClick={() => navigate('/employer/create-job')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
                    >
                        Post Your First Job
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {jobs.map((job) => (
                            <motion.div
                                key={job._id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-200 transition-all"
                            >
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.status === 'open'
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                        >
                                            {job.status}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-sm line-clamp-2">{job.description}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                                            <span>₹{job.wage.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span>{job.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <MapPin className="w-4 h-4 text-rose-500" />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>

                                    {job.requiredSkills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {job.requiredSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                                    <Link
                                        to={`/jobs/${job._id}`}
                                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
                                        title="View Job Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Details</span>
                                    </Link>

                                    <button
                                        onClick={() => handleToggleStatus(job._id, job.status)}
                                        className={`px-4 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold ${job.status === 'open'
                                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}
                                    >
                                        {job.status === 'open' ? (
                                            <>
                                                <ToggleLeft className="w-4 h-4" />
                                                <span>Close Job</span>
                                            </>
                                        ) : (
                                            <>
                                                <ToggleRight className="w-4 h-4" />
                                                <span>Reopen</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteJob(job._id, job.title)}
                                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200"
                                        title="Delete Job"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default EmployerManageJobsPage;
