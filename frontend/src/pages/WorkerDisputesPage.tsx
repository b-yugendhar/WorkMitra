import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldAlert, AlertTriangle, Clock, PlusCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AgreementOption {
    _id: string;
    jobId: {
        title: string;
    };
    employerId: {
        fullName: string;
    };
}

interface DisputeItem {
    _id: string;
    agreementId?: {
        jobId?: {
            title: string;
        };
    };
    raisedBy?: {
        fullName: string;
        role: string;
    };
    againstUser?: {
        fullName: string;
        role: string;
    };
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'rejected';
    resolutionDetails?: string;
    createdAt: string;
}

export const WorkerDisputesPage: React.FC = () => {
    const [disputes, setDisputes] = useState<DisputeItem[]>([]);
    const [agreements, setAgreements] = useState<AgreementOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal / Form state
    const [showForm, setShowForm] = useState(false);
    const [selectedAgreementId, setSelectedAgreementId] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDisputesAndAgreements();
    }, []);

    const fetchDisputesAndAgreements = async () => {
        try {
            setLoading(true);
            setError(null);
            const [disRes, agRes] = await Promise.all([
                api.get('/disputes/my'),
                api.get('/agreements'),
            ]);
            setDisputes(disRes.data);
            setAgreements(agRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load disputes data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgreementId || !reason.trim() || !description.trim()) {
            alert('Please fill out all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/disputes', {
                agreementId: selectedAgreementId,
                reason,
                description,
            });
            setShowForm(false);
            setReason('');
            setDescription('');
            setSelectedAgreementId('');
            fetchDisputesAndAgreements();
            alert('Dispute raised successfully! WorkMitra dispute team has been notified.');
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Dispute & Protection Center <ShieldAlert className="h-6 w-6 text-rose-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Report wage withholding, contract breaches, or unsafe working conditions
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                    <PlusCircle className="h-4 w-4" /> Raise New Dispute
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Raise Dispute Form */}
            {showForm && (
                <form onSubmit={handleCreateDispute} className="bg-rose-50/50 p-6 rounded-xl border border-rose-200 space-y-4">
                    <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-600" /> File Official Dispute Report
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Select Associated Work Contract *</label>
                            <select
                                value={selectedAgreementId}
                                onChange={(e) => setSelectedAgreementId(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:ring-2 focus:ring-rose-500"
                            >
                                <option value="">-- Choose Contract --</option>
                                {agreements.map((ag) => (
                                    <option key={ag._id} value={ag._id}>
                                        {ag.jobId?.title || 'Contract'} (Employer: {ag.employerId?.fullName || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Reason / Issue Category *</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Non-payment of agreed wage, Scope creep"
                                required
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Explanation *</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details of what happened, work completed, or agreements broken..."
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:ring-2 focus:ring-rose-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                            Submit Dispute
                        </button>
                    </div>
                </form>
            )}

            {/* Dispute List */}
            <div className="space-y-4">
                {disputes.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                        <h3 className="text-base font-bold text-gray-800">No Active Disputes</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                            Your account is in good standing. If you encounter issue with an employer, file a dispute here.
                        </p>
                    </div>
                ) : (
                    disputes.map((dis) => (
                        <div key={dis._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${dis.status === 'resolved'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : dis.status === 'open'
                                            ? 'bg-rose-100 text-rose-800 font-bold animate-pulse'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        Status: {dis.status.replace('_', ' ')}
                                    </span>
                                    <h3 className="text-base font-bold text-gray-900 mt-1">{dis.reason}</h3>
                                    {dis.agreementId?.jobId?.title && (
                                        <p className="text-xs text-gray-500 font-semibold">Contract: {dis.agreementId.jobId.title}</p>
                                    )}
                                </div>

                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> {new Date(dis.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                                {dis.description}
                            </p>

                            {dis.resolutionDetails && (
                                <div className="bg-emerald-50 p-3 rounded border border-emerald-200 text-xs text-emerald-900 space-y-1">
                                    <strong className="block font-bold">Admin Resolution:</strong>
                                    <p>{dis.resolutionDetails}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
