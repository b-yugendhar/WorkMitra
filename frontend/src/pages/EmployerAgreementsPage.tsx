import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileCheck, Clock, User, IndianRupee, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface AgreementItem {
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
    };
    agreedWage: number;
    duration: string;
    terms: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
    paymentStatus?: 'pending' | 'escrow' | 'released';
    createdAt: string;
}

export const EmployerAgreementsPage: React.FC = () => {
    const [agreements, setAgreements] = useState<AgreementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/agreements/employer');
            setAgreements(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load work contracts');
        } finally {
            setLoading(false);
        }
    };

    const filteredAgreements = agreements.filter((ag) => {
        if (filterStatus === 'all') return true;
        return ag.status === filterStatus;
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Work Contracts & Agreements <FileCheck className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track active work agreements, worker progress, and contract completion.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        All ({agreements.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'active' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Active ({agreements.filter((a) => a.status === 'active').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'completed' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Completed ({agreements.filter((a) => a.status === 'completed').length})
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {filteredAgreements.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                    <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">No work contracts found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                        Accept candidates from your job listings to generate formal work agreements.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAgreements.map((agreement) => (
                        <div
                            key={agreement._id}
                            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                        {agreement.jobId?.title || 'Work Contract'}
                                    </h3>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${agreement.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : agreement.status === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : agreement.status === 'disputed'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {agreement.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-500" />
                                        <span>Worker: <strong className="text-gray-900">{agreement.workerId?.fullName || 'Assigned Worker'}</strong> ({agreement.workerId?.phone})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="h-4 w-4 text-emerald-500" />
                                        <span>Agreed Wage: <strong className="text-gray-900">₹{agreement.agreedWage}</strong> ({agreement.duration})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>Issued: {new Date(agreement.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-100 line-clamp-2">
                                    "{agreement.terms}"
                                </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${agreement.paymentStatus === 'released'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    Payment: {agreement.paymentStatus ? agreement.paymentStatus.toUpperCase() : 'PENDING'}
                                </span>

                                <Link
                                    to={`/employer/agreements/${agreement._id}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    Manage Contract <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
