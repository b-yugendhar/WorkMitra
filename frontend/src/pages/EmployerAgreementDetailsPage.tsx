import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    FileCheck,
    User,
    IndianRupee,
    Clock,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    TrendingUp,
    ShieldAlert,
    Loader2
} from 'lucide-react';

export const EmployerAgreementDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const [agreement, setAgreement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/agreements/${id}`);
            setAgreement(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load agreement details');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteWork = async () => {
        if (!window.confirm('Are you sure you want to mark this contract work as COMPLETED?')) return;

        try {
            setCompleting(true);
            await api.post(`/agreements/${id}/complete`);
            alert('Work marked as completed successfully!');
            fetchDetails();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to complete work contract');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    if (error || !agreement) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-center">
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl">
                    <AlertTriangle className="h-10 w-10 text-rose-600 mx-auto mb-2" />
                    <h3 className="font-bold">{error || 'Agreement contract not found'}</h3>
                    <Link to="/employer/agreements" className="text-xs font-semibold text-rose-700 underline mt-2 block">
                        Back to Agreements
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to="/employer/agreements" className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contract #{agreement._id.substring(18)}</h1>
                    <p className="text-sm text-gray-500">Official Work Contract Details & Action Hub</p>
                </div>
            </div>

            {/* Main Contract Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                        <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Job Listing</span>
                        <h2 className="text-xl font-bold text-gray-900">{agreement.jobId?.title || 'Job Contract'}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${agreement.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : agreement.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : agreement.status === 'disputed'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-gray-100 text-gray-800'
                            }`}>
                            {agreement.status.toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${agreement.paymentStatus === 'released'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                            PAYMENT: {agreement.paymentStatus ? agreement.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                    </div>
                </div>

                {/* Worker & Employer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Assigned Worker</span>
                        <div className="mt-1 flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-600" />
                            <span className="font-bold text-gray-900">{agreement.workerId?.fullName || 'Worker'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Phone: {agreement.workerId?.phone}</p>
                        {agreement.workerId?.email && <p className="text-xs text-gray-500">Email: {agreement.workerId?.email}</p>}
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Employer (You)</span>
                        <div className="mt-1 flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-600" />
                            <span className="font-bold text-gray-900">{agreement.employerId?.fullName || 'Employer'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Phone: {agreement.employerId?.phone}</p>
                    </div>
                </div>

                {/* Contract Financial & Time Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                        <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" /> Agreed Wage
                        </span>
                        <p className="text-xl font-extrabold text-gray-900 mt-1">₹{agreement.agreedWage}</p>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Expected Duration
                        </span>
                        <p className="text-xl font-extrabold text-gray-900 mt-1">{agreement.duration}</p>
                    </div>

                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                            <FileCheck className="h-3.5 w-3.5" /> Issue Date
                        </span>
                        <p className="text-sm font-bold text-gray-900 mt-2">{new Date(agreement.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Contract Terms */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-900">Official Contract Terms & Scope</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-line leading-relaxed">
                        {agreement.terms}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/employer/agreements/${agreement._id}/progress`}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <TrendingUp className="h-4 w-4" /> Work Progress & Updates
                        </Link>

                        {agreement.status === 'active' && (
                            <button
                                onClick={handleCompleteWork}
                                disabled={completing}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                                {completing ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                Mark Work Completed
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {agreement.status === 'completed' && agreement.paymentStatus !== 'released' && (
                            <Link
                                to="/employer/payments"
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <CreditCard className="h-4 w-4" /> Process Payment
                            </Link>
                        )}

                        {agreement.status !== 'disputed' && (
                            <Link
                                to="/employer/disputes"
                                className="px-3.5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                                <ShieldAlert className="h-4 w-4" /> Raise Dispute
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
