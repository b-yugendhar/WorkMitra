import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CreditCard, IndianRupee, ShieldCheck, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface PaymentItem {
    _id: string;
    agreementId: {
        _id: string;
        jobId?: {
            title: string;
        };
        agreedWage: number;
    };
    employerId: {
        _id: string;
        fullName: string;
        phone: string;
        email?: string;
    };
    amount: number;
    status: 'pending' | 'escrow' | 'paid' | 'failed';
    paymentReference?: string;
    paidAt?: string;
    createdAt: string;
}

export const WorkerPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/payments/my');
            setPayments(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load payment history');
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

    const totalEarned = payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingEscrow = payments
        .filter((p) => p.status === 'pending' || p.status === 'escrow')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Worker Payments & Earnings <CreditCard className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track completed job compensation, payout history, and escrow status.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> WorkMitra Escrow Guaranteed
                    </span>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Received</span>
                        <span className="text-2xl font-black text-emerald-600 flex items-center gap-0.5 mt-1">
                            <IndianRupee className="h-5 w-5" /> {totalEarned.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">In Escrow / Pending</span>
                        <span className="text-2xl font-black text-amber-600 flex items-center gap-0.5 mt-1">
                            <IndianRupee className="h-5 w-5" /> {pendingEscrow.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Payment Receipts</h3>

                {payments.length === 0 ? (
                    <div className="text-center py-10">
                        <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No payment receipts recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((pmt) => (
                            <div key={pmt._id} className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-gray-900">
                                            {pmt.agreementId?.jobId?.title || 'Contract Payout'}
                                        </h4>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pmt.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {pmt.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Employer: <strong className="text-gray-700">{pmt.employerId?.fullName || 'Employer'}</strong> ({pmt.employerId?.phone})
                                    </p>
                                    {pmt.paymentReference && (
                                        <p className="text-xs font-mono text-indigo-600">Ref Code: {pmt.paymentReference}</p>
                                    )}
                                </div>

                                <div className="text-left sm:text-right">
                                    <span className="text-lg font-extrabold text-emerald-600 flex items-center gap-0.5 sm:justify-end">
                                        <IndianRupee className="h-4 w-4" /> {pmt.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400 block mt-0.5">
                                        {pmt.paidAt ? new Date(pmt.paidAt).toLocaleDateString() : new Date(pmt.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
