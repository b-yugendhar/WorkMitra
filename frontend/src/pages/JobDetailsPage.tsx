import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, User, Phone, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Send, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface JobDetails {
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    location: string;
    wage: number;
    duration: string;
    status: 'open' | 'closed' | 'in_progress';
    employerId?: {
        _id: string;
        fullName?: string;
        phone?: string;
        email?: string;
    };
    createdAt: string;
}

const JobDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState<JobDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Apply modal state (Placeholder for next milestone)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [coverNote, setCoverNote] = useState('');
    const [isSubmittingApply, setIsSubmittingApply] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            setErrorMessage('');
            try {
                const res = await api.get<JobDetails>(`/jobs/${id}`);
                setJob(res.data);
            } catch (error: any) {
                setErrorMessage(error.response?.data?.message || 'Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchJob();
    }, [id]);

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingApply(true);
        try {
            await api.post(`/jobs/${id}/apply`, { coverNote });
            setApplySuccess(true);
            setTimeout(() => {
                setIsApplyModalOpen(false);
                setApplySuccess(false);
                setCoverNote('');
            }, 2000);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit application.');
        } finally {
            setIsSubmittingApply(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-32 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                <p className="font-semibold text-slate-600">Loading job details...</p>
            </div>
        );
    }

    if (errorMessage || !job) {
        return (
            <div className="p-8 max-w-3xl mx-auto text-center">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-3xl mb-6">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-2">Job Not Found</h3>
                    <p className="text-sm">{errorMessage || 'The requested job posting does not exist or has been removed.'}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    const isOwner = user && job.employerId?._id === user.id;

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans">
            {/* Navigation back */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to jobs list
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 space-y-8"
            >
                {/* Header card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.status === 'open'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                            >
                                Status: {job.status}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                                Posted on {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-slate-800 leading-tight">{job.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 pt-1">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Duration: {job.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                <span>Location: {job.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Wage badge & Action */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700 min-w-[220px] flex flex-col justify-between items-center text-center shadow-lg">
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1">Guaranteed Wage</span>
                        <div className="text-3xl font-black text-emerald-400 mb-4">₹{job.wage.toLocaleString()}</div>

                        {user?.role === 'worker' && (
                            <button
                                onClick={() => setIsApplyModalOpen(true)}
                                disabled={job.status !== 'open'}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                            >
                                <Send className="w-4 h-4" />
                                {job.status === 'open' ? 'Apply for Job' : 'Job Closed'}
                            </button>
                        )}

                        {isOwner && (
                            <Link
                                to="/employer/jobs"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition-all block text-center"
                            >
                                Manage This Job
                            </Link>
                        )}

                        {!user && (
                            <Link
                                to="/login"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-sm block text-center"
                            >
                                Login to Apply
                            </Link>
                        )}
                    </div>
                </div>

                {/* Required Skills */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Required Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="bg-blue-50 text-blue-800 border border-blue-100 font-bold px-4 py-2 rounded-xl text-sm shadow-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Full Job Description</h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 text-base leading-relaxed whitespace-pre-line font-medium">
                        {job.description}
                    </div>
                </div>

                {/* Employer Details */}
                {job.employerId && (
                    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            <div>
                                <h3 className="text-lg font-bold">Verified Employer Details</h3>
                                <p className="text-slate-400 text-xs">WorkMitra Verified Account</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-2">
                            <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                                <User className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Employer Name</p>
                                    <p className="font-bold">{job.employerId.fullName || 'WorkMitra Employer'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                                <Phone className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Phone</p>
                                    <p className="font-bold">{job.employerId.phone || 'Available after match'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                                <Mail className="w-5 h-5 text-rose-400" />
                                <div>
                                    <p className="text-xs text-slate-400">Email</p>
                                    <p className="font-bold">{job.employerId.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Apply Placeholder Modal */}
            <AnimatePresence>
                {isApplyModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-emerald-600" />
                                    Apply for "{job.title}"
                                </h3>
                                <button
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {applySuccess ? (
                                <div className="p-6 text-center bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-600" />
                                    <h4 className="font-bold text-lg">Application Submitted!</h4>
                                    <p className="text-sm mt-1">The employer has been notified. You can track this in your dashboard.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApplySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Cover Note / Message to Employer
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={coverNote}
                                            onChange={(e) => setCoverNote(e.target.value)}
                                            placeholder="Introduce yourself, mention your relevant experience or tool availability..."
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                                        ></textarea>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 font-medium">
                                        💡 Your verified phone number and skills profile will automatically be shared with the employer upon submission.
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsApplyModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingApply}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2"
                                        >
                                            {isSubmittingApply ? 'Submitting...' : 'Confirm Application'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobDetailsPage;
