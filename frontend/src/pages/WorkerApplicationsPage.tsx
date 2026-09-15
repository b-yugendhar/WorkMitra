import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Briefcase,
    Clock,
    MapPin,
    IndianRupee,
    FileText,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';

interface ApplicationItem {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        location?: string;
        wage?: number;
        duration?: string;
        status?: string;
        employerId?: {
            fullName?: string;
            phone?: string;
        };
    };
    status: 'applied' | 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'hired' | 'rejected';
    coverNote?: string;
    createdAt: string;
}

export const WorkerApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/applications/my');
            setApplications(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        My Job Applications <Briefcase className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track application statuses and responses from employers
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {applications.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-800">No Job Applications Yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Explore available jobs in the marketplace and submit applications to start earning.
                    </p>
                    <Link
                        to="/worker/jobs"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Browse Jobs <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map((app) => (
                        <div
                            key={app._id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                        {app.jobId?.title || 'Job Listing'}
                                    </h3>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${app.status === 'accepted' || app.status === 'hired'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : app.status === 'rejected'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {(app.status === 'accepted' || app.status === 'hired') && <CheckCircle2 className="h-3 w-3" />}
                                        {app.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                        {app.status.toUpperCase()}
                                    </span>
                                </div>

                                {app.jobId?.employerId?.fullName && (
                                    <p className="text-xs text-gray-500 font-semibold">
                                        Employer: {app.jobId.employerId.fullName}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 pt-1">
                                    {app.jobId?.wage && (
                                        <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold">
                                            <IndianRupee className="h-3.5 w-3.5" /> ₹{app.jobId.wage.toLocaleString()}
                                        </span>
                                    )}
                                    {app.jobId?.location && (
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-700">
                                            <MapPin className="h-3.5 w-3.5 text-rose-500" /> {app.jobId.location}
                                        </span>
                                    )}
                                </div>

                                {app.coverNote && (
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100 italic line-clamp-2">
                                        "{app.coverNote}"
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                                </span>

                                {app.jobId?._id && (
                                    <Link
                                        to={`/jobs/${app.jobId._id}`}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                        View Details <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
