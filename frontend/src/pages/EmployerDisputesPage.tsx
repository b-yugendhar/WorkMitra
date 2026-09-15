import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertTriangle, ShieldAlert, PlusCircle, Loader2, AlertCircle } from 'lucide-react';

interface DisputeItem {
    _id: string;
    agreementId?: {
        jobId?: {
            title: string;
        };
    };
    raisedBy: {
        _id: string;
        fullName: string;
        role: string;
    };
    againstUser: {
        _id: string;
        fullName: string;
        role: string;
    };
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    resolutionNotes?: string;
    createdAt: string;
}

export const EmployerDisputesPage: React.FC = () => {
    const [disputes, setDisputes] = useState<DisputeItem[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New dispute modal state
    const [selectedAgreementId, setSelectedAgreementId] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDisputes();
        fetchAgreements();
    }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/disputes/my');
            setDisputes(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAgreements = async () => {
        try {
            const res = await api.get('/agreements/employer');
            setAgreements(res.data);
        } catch (err: any) {
            console.error('Error fetching agreements for dispute selection', err);
        }
    };

    const handleDisputeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgreementId || !reason.trim() || !description.trim()) {
            alert('Please select an agreement, reason, and description.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/disputes', {
                agreementId: selectedAgreementId,
                reason: reason.trim(),
                description: description.trim(),
            });

            alert('Dispute submitted successfully! WorkMitra dispute team notified.');
            setSelectedAgreementId('');
            setReason('');
            setDescription('');
            fetchDisputes();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to raise dispute');
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

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Contract Dispute Resolution <ShieldAlert className="h-6 w-6 text-amber-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Report issues regarding work quality, attendance, or contractual terms.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Raise Dispute Form Card */}
            {agreements.length > 0 && (
                <form onSubmit={handleDisputeSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <PlusCircle className="h-5 w-5 text-amber-600" /> Raise New Contract Dispute
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Agreement *</label>
                            <select
                                value={selectedAgreementId}
                                onChange={(e) => setSelectedAgreementId(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                            >
                                <option value="">-- Choose Contract --</option>
                                {agreements.map((ag) => (
                                    <option key={ag._id} value={ag._id}>
                                        {ag.jobId?.title || 'Contract'} - Worker: {ag.workerId?.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Dispute *</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                placeholder="e.g. Worker no-show, Incomplete work"
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Explanation *</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Provide clear details and facts regarding the contract violation or issue..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                            {submitting && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                            File Official Dispute
                        </button>
                    </div>
                </form>
            )}

            {/* Disputes History */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Disputes Log & Status</h3>

                {disputes.length === 0 ? (
                    <div className="text-center py-10">
                        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No disputes filed or reported.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((disp) => (
                            <div key={disp._id} className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-gray-900">{disp.reason}</h4>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${disp.status === 'open'
                                                ? 'bg-amber-100 text-amber-800'
                                                : disp.status === 'resolved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {disp.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Contract: <strong className="text-gray-700">{disp.agreementId?.jobId?.title || 'Contract'}</strong> • Against: {disp.againstUser?.fullName}
                                        </p>
                                    </div>

                                    <span className="text-xs text-gray-400">
                                        {new Date(disp.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-700 bg-white p-2.5 rounded border border-amber-100">
                                    "{disp.description}"
                                </p>

                                {disp.resolutionNotes && (
                                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200 font-medium">
                                        <strong>Admin Resolution Note:</strong> {disp.resolutionNotes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
