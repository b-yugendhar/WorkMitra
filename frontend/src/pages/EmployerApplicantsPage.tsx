import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Users, CheckCircle, XCircle, FileText, ArrowLeft, Loader2, Award, Phone, Mail, PlusCircle, AlertCircle } from 'lucide-react';

interface ApplicationItem {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        location?: string;
        wage?: number;
    };
    workerId: {
        _id: string;
        fullName: string;
        phone: string;
        email?: string;
        profileImage?: string;
    };
    coverNote?: string;
    matchScore?: number;
    status: 'applied' | 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'hired' | 'rejected';
    appliedAt: string;
}

export const EmployerApplicantsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId?: string }>();
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [jobTitle, setJobTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Create Agreement Modal State
    const [agreementModalApp, setAgreementModalApp] = useState<ApplicationItem | null>(null);
    const [agreedWage, setAgreedWage] = useState<number | ''>('');
    const [duration, setDuration] = useState<string>('1 Day');
    const [terms, setTerms] = useState<string>('Standard daily work agreement.');
    const [creatingAgreement, setCreatingAgreement] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            if (jobId) {
                const res = await api.get(`/jobs/${jobId}/applications`);
                setApplications(res.data);
                if (res.data.length > 0 && res.data[0].jobId) {
                    setJobTitle(res.data[0].jobId.title);
                } else {
                    const jobRes = await api.get(`/jobs/${jobId}`);
                    setJobTitle(jobRes.data.title);
                }
            } else {
                const res = await api.get('/applications/my');
                setApplications(res.data);
                setJobTitle('All Job Applications');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load applicant list');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId: string, status: 'accepted' | 'rejected') => {
        try {
            setActionLoadingId(appId);
            await api.put(`/applications/${appId}/status`, { status });
            setApplications((prev) =>
                prev.map((app) => (app._id === appId ? { ...app, status } : app))
            );
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update application status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleOpenAgreementModal = (app: ApplicationItem) => {
        setAgreementModalApp(app);
        setAgreedWage(app.jobId.wage || 500);
        setDuration('1 Day');
        setTerms(`Work agreement for ${app.jobId.title}. Agreed daily wage of ₹${app.jobId.wage || 500}.`);
        setModalError(null);
    };

    const handleCreateAgreementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreementModalApp) return;

        if (!agreedWage || agreedWage <= 0 || !terms.trim()) {
            setModalError('Please enter a valid wage and contract terms.');
            return;
        }

        try {
            setCreatingAgreement(true);
            setModalError(null);
            await api.post('/agreements', {
                jobId: agreementModalApp.jobId._id,
                applicationId: agreementModalApp._id,
                workerId: agreementModalApp.workerId._id,
                agreedWage: Number(agreedWage),
                duration,
                terms: terms.trim(),
            });

            // Update app status locally
            setApplications((prev) =>
                prev.map((a) => (a._id === agreementModalApp._id ? { ...a, status: 'accepted' } : a))
            );
            setAgreementModalApp(null);
            alert('Work agreement created successfully! Worker notified.');
        } catch (err: any) {
            setModalError(err.response?.data?.message || 'Failed to create work agreement.');
        } finally {
            setCreatingAgreement(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        if (selectedStatus === 'all') return true;
        if (selectedStatus === 'pending') return app.status === 'applied' || app.status === 'pending' || app.status === 'reviewed';
        return app.status === selectedStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <Link to="/employer/jobs" className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Applicants <Users className="h-6 w-6 text-indigo-600" />
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {jobTitle ? `Candidates for "${jobTitle}"` : 'Manage worker applications'}
                        </p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        All ({applications.length})
                    </button>
                    <button
                        onClick={() => setSelectedStatus('pending')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${selectedStatus === 'pending' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Pending ({applications.filter((a) => a.status === 'applied' || a.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setSelectedStatus('accepted')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${selectedStatus === 'accepted' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Accepted ({applications.filter((a) => a.status === 'accepted' || a.status === 'hired').length})
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Applicants List */}
            {filteredApplications.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No applicants found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                        There are currently no candidates matching the selected status filter.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((app) => (
                        <div key={app._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {app.workerId?.fullName || 'Worker Applicant'}
                                        </h3>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${app.status === 'accepted' || app.status === 'hired'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : app.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {app.status.toUpperCase()}
                                        </span>
                                        {app.matchScore && (
                                            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Award className="h-3 w-3" /> {app.matchScore}% Skill Match
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Applied for: <span className="font-semibold text-gray-700">{app.jobId?.title || jobTitle}</span> • {new Date(app.appliedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 pt-1">
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" /> {app.workerId?.phone}
                                        </span>
                                        {app.workerId?.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" /> {app.workerId?.email}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end md:self-auto">
                                    {app.status !== 'accepted' && app.status !== 'hired' && app.status !== 'rejected' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                disabled={actionLoadingId === app._id}
                                                className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'accepted')}
                                                disabled={actionLoadingId === app._id}
                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                <CheckCircle className="h-4 w-4" /> Accept Candidate
                                            </button>
                                        </>
                                    )}

                                    {(app.status === 'accepted' || app.status === 'hired') && (
                                        <button
                                            onClick={() => handleOpenAgreementModal(app)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                        >
                                            <PlusCircle className="h-4 w-4" /> Issue Work Agreement
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Cover Note Section */}
                            {app.coverNote && (
                                <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-lg text-xs text-gray-700 flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-900 block mb-0.5">Cover Note / Intro:</span>
                                        "{app.coverNote}"
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Work Agreement Modal */}
            {agreementModalApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Issue Work Agreement</h3>
                            <button onClick={() => setAgreementModalApp(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {modalError && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs font-medium">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleCreateAgreementSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Worker</label>
                                <input
                                    type="text"
                                    disabled
                                    value={agreementModalApp.workerId?.fullName || 'Worker'}
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    disabled
                                    value={agreementModalApp.jobId?.title || jobTitle}
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Agreed Wage (₹) *</label>
                                    <input
                                        type="number"
                                        value={agreedWage}
                                        onChange={(e) => setAgreedWage(e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Duration *</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Terms & Deliverables *</label>
                                <textarea
                                    rows={3}
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setAgreementModalApp(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingAgreement}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                                >
                                    {creatingAgreement && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                                    Confirm & Create Contract
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
