import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    TrendingUp,
    Clock,
    User,
    Loader2,
    PlusCircle
} from 'lucide-react';

interface WorkUpdateItem {
    _id: string;
    workerId: {
        _id: string;
        fullName: string;
        phone?: string;
    };
    message: string;
    progress: number;
    proofFiles: string[];
    employerApproval: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const EmployerWorkProgressPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [updates, setUpdates] = useState<WorkUpdateItem[]>([]);
    const [agreement, setAgreement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New update state
    const [newProgress, setNewProgress] = useState<number>(50);
    const [newMessage, setNewMessage] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchAgreement();
            fetchUpdates();
        }
    }, [id]);

    const fetchAgreement = async () => {
        try {
            const res = await api.get(`/agreements/${id}`);
            setAgreement(res.data);
        } catch (err: any) {
            console.error('Error loading agreement', err);
        }
    };

    const fetchUpdates = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/agreements/${id}/updates`);
            setUpdates(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load progress updates');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAction = async (updateId: string, action: 'approved' | 'rejected') => {
        try {
            setActionLoadingId(updateId);
            await api.post(`/agreements/${id}/approve-update`, { updateId, action });
            setUpdates((prev) =>
                prev.map((u) => (u._id === updateId ? { ...u, employerApproval: action } : u))
            );
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${action} update`);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCreateUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newProgress < 0 || newProgress > 100) {
            alert('Progress must be between 0 and 100%');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.put(`/agreements/${id}/progress`, {
                progress: newProgress,
                message: newMessage || `Progress set to ${newProgress}% by employer`,
            });
            setUpdates([res.data, ...updates]);
            setNewMessage('');
            alert('Progress update recorded!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit progress update');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    const latestProgress = updates.length > 0 ? updates[0].progress : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to={`/employer/agreements/${id}`} className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Work Progress Tracker <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500">
                        {agreement?.jobId?.title ? `Contract: ${agreement.jobId.title}` : 'Milestone & Execution Updates'}
                    </p>
                </div>
            </div>

            {/* Current Completion Progress Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Overall Work Completion</span>
                        <h2 className="text-2xl font-black text-gray-900">{latestProgress}% Completed</h2>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${latestProgress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                        {latestProgress === 100 ? '✓ Ready for Completion' : 'Work In Progress'}
                    </span>
                </div>

                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${latestProgress}%` }}
                    />
                </div>
            </div>

            {/* Post Progress Update Form */}
            <form onSubmit={handleCreateUpdate} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-indigo-600" /> Record Employer Work Progress Note
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Completion %</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={newProgress}
                            onChange={(e) => setNewProgress(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Update Message / Instructions</label>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="e.g. Site inspection completed, 60% task verified."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                    >
                        {submitting && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                        Record Progress Update
                    </button>
                </div>
            </form>

            {/* Updates Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Progress History Timeline</h3>

                {error && (
                    <div className="bg-rose-50 text-rose-800 p-3 rounded text-xs">
                        {error}
                    </div>
                )}

                {updates.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No progress updates reported yet.</p>
                ) : (
                    <div className="space-y-4">
                        {updates.map((update) => (
                            <div key={update._id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-500" />
                                        <span className="font-bold text-sm text-gray-900">
                                            {update.workerId?.fullName || 'Worker Update'}
                                        </span>
                                        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                            {update.progress}%
                                        </span>
                                    </div>

                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${update.employerApproval === 'approved'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : update.employerApproval === 'rejected'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {update.employerApproval.toUpperCase()}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-700 font-medium">"{update.message}"</p>

                                <div className="flex justify-between items-center pt-2 text-xs text-gray-500 border-t border-gray-200/50">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" /> {new Date(update.createdAt).toLocaleString()}
                                    </span>

                                    {update.employerApproval === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApproveAction(update._id, 'rejected')}
                                                disabled={actionLoadingId === update._id}
                                                className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded hover:bg-rose-200"
                                            >
                                                Request Revision
                                            </button>
                                            <button
                                                onClick={() => handleApproveAction(update._id, 'approved')}
                                                disabled={actionLoadingId === update._id}
                                                className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                                            >
                                                Approve Progress
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
