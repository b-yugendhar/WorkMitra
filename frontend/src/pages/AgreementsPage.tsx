import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';

const AgreementsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<any>(null);

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        try {
            const response = await api.get('/agreements');
            setAgreements(response.data.length ? response.data : getFallbackMockData());
        } catch (error) {
            console.error("API error, falling back to mock", error);
            setAgreements(getFallbackMockData());
        } finally {
            setLoading(false);
        }
    };

    const getFallbackMockData = () => [
        { _id: '1', jobId: { _id: 'j1', title: 'Plumbing Repair at TechPark' }, workerId: { name: 'Ravi Kumar', _id: 'w1' }, agreedAmount: '₹1,500', status: 'active', paymentStatus: 'escrow' },
        { _id: '2', jobId: { _id: 'j2', title: 'Office Networking Setup' }, workerId: { name: 'Suresh Iyer', _id: 'w2' }, agreedAmount: '₹12,000', status: 'completed', paymentStatus: 'escrow' },
        { _id: '3', jobId: { _id: 'j3', title: 'AC Installation' }, workerId: { name: 'Ali Khan', _id: 'w3' }, agreedAmount: '₹800', status: 'disputed', paymentStatus: 'escrow' },
    ];

    const handleReleasePayment = async (id: string, workerName: string, workerId: string, jobId: string) => {
        try {
            // await api.post(`/agreements/${id}/pay`, { paymentAction: 'released' });
            setAgreements(agreements.map(a => a._id === id ? { ...a, paymentStatus: 'released', status: 'completed' } : a));

            // Open Review Modal after payment
            setReviewTarget({ workerName, workerId, jobId });
            setIsReviewOpen(true);
        } catch (error) {
            console.error("Failed to release payment", error);
        }
    };

    const handleRaiseDispute = async (id: string) => {
        try {
            // await api.put(`/agreements/${id}/status`, { status: 'disputed' });
            setAgreements(agreements.map(a => a._id === id ? { ...a, status: 'disputed' } : a));
        } catch (error) {
            console.error("Error raising dispute", error);
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        try {
            // await api.post('/reviews', { jobId: reviewTarget.jobId, revieweeId: reviewTarget.workerId, rating, comment });
            console.log("Review submitted!", { rating, comment, target: reviewTarget });
            setIsReviewOpen(false);
            setReviewTarget(null);
        } catch (error) {
            console.error("Error submitting review", error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'active': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'disputed': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            default: return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Employer Agreements</h2>
                    <p className="text-slate-500 mt-1">Manage and track your active contracts</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all font-medium transform hover:-translate-y-0.5">
                    + New Agreement
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-72">
                        <input
                            type="text"
                            placeholder="Search agreements..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Worker</th>
                                <th className="px-6 py-4">Agreed Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence>
                                {loading && (<tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading agreements...</td></tr>)}
                                {!loading && agreements.filter(a => a.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase())).map((agreement, idx) => (
                                    <motion.tr
                                        key={agreement._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5 font-semibold text-slate-800">{agreement.jobId?.title}</td>
                                        <td className="px-6 py-5 text-slate-600">{agreement.workerId?.name}</td>
                                        <td className="px-6 py-5 text-slate-800 font-medium">{agreement.agreedAmount}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(agreement.status)}
                                                <span className="capitalize font-medium text-slate-700">{agreement.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-3">
                                            {agreement.status === 'completed' && agreement.paymentStatus === 'escrow' ? (
                                                <button
                                                    onClick={() => handleReleasePayment(agreement._id, agreement.workerId?.name, agreement.workerId?._id, agreement.jobId?._id)}
                                                    className="text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full font-medium hover:bg-emerald-100 transition-colors"
                                                >
                                                    Release Payment
                                                </button>
                                            ) : agreement.status === 'active' ? (
                                                <button
                                                    onClick={() => handleRaiseDispute(agreement._id)}
                                                    className="text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full font-medium hover:bg-amber-100 transition-colors"
                                                >
                                                    Report Issue
                                                </button>
                                            ) : (
                                                <button className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {reviewTarget && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => { setIsReviewOpen(false); setReviewTarget(null); }}
                    onSubmit={handleReviewSubmit}
                    revieweeName={reviewTarget.workerName}
                />
            )}
        </motion.div>
    );
};

export default AgreementsPage;
