import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CreditCard, IndianRupee, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface PaymentItem {
    _id: string;
    agreementId: {
        _id: string;
        jobId?: {
            title: string;
        };
        agreedWage: number;
    };
    workerId: {
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

export const EmployerPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pay Modal state
    const [payAgreementId, setPayAgreementId] = useState<string>('');
    const [payAmount, setPayAmount] = useState<number | ''>('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPayments();
        fetchPendingAgreements();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/payments/employer');
            setPayments(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load payments history');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAgreements = async () => {
        try {
            const res = await api.get('/agreements/employer');
            // Filter completed or active agreements with pending payment status
            const pending = res.data.filter((ag: any) => ag.paymentStatus !== 'released');
            setAgreements(pending);
        } catch (err: any) {
            console.error('Error loading pending agreements for payout', err);
        }
    };

    const handleProcessPaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payAgreementId || !payAmount) {
            alert('Please select an agreement and enter payment amount.');
            return;
        }

        try {
            setProcessing(true);
            const res = await api.post('/payments', {
                agreementId: payAgreementId,
                amount: Number(payAmount),
            });

            alert(`Payment of ₹${payAmount} processed successfully!\nReference: ${res.data.payment?.paymentReference}`);
            setPayAgreementId('');
            setPayAmount('');
            fetchPayments();
            fetchPendingAgreements();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to process payment');
        } finally {
            setProcessing(false);
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Employer Payments & Payouts <CreditCard className="h-6 w-6 text-indigo-600" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Securely release worker compensation and view transaction history.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> WorkMitra Escrow Protected
                    </span>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Simulated Payment Form Card */}
            {agreements.length > 0 && (
                <form onSubmit={handleProcessPaymentSubmit} className="bg-indigo-900 text-white p-6 rounded-xl shadow-md space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-100">
                        <IndianRupee className="h-5 w-5 text-emerald-400" /> Process Pending Worker Payment
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-indigo-200 mb-1">Select Pending Contract *</label>
                            <select
                                value={payAgreementId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setPayAgreementId(selectedId);
                                    const selected = agreements.find((a) => a._id === selectedId);
                                    if (selected) setPayAmount(selected.agreedWage);
                                }}
                                required
                                className="w-full px-3 py-2 bg-indigo-950 border border-indigo-700 text-white rounded text-sm focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="">-- Choose Contract --</option>
                                {agreements.map((ag) => (
                                    <option key={ag._id} value={ag._id}>
                                        {ag.jobId?.title || 'Contract'} - Worker: {ag.workerId?.fullName} (₹{ag.agreedWage})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-indigo-200 mb-1">Payment Amount (₹) *</label>
                            <input
                                type="number"
                                min="1"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                required
                                className="w-full px-3 py-2 bg-indigo-950 border border-indigo-700 text-white rounded text-sm focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-indigo-950 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {processing && <Loader2 className="animate-spin h-4 w-4" />}
                            Confirm & Release Payment
                        </button>
                    </div>
                </form>
            )}

            {/* Payment History List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Transaction History</h3>

                {payments.length === 0 ? (
                    <div className="text-center py-10">
                        <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No payment transactions recorded yet.</p>
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
                                        Paid To: <strong className="text-gray-700">{pmt.workerId?.fullName || 'Worker'}</strong> ({pmt.workerId?.phone})
                                    </p>
                                    {pmt.paymentReference && (
                                        <p className="text-xs font-mono text-indigo-600">Ref: {pmt.paymentReference}</p>
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
