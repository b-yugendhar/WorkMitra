import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../services/api';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState<any[]>([]);

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                const res = await api.get('/admin/disputes');
                setDisputes(res.data.disputes || []);
            } catch (e) {
                console.error('Failed to fetch disputes:', e);
            }
        };

        fetchDisputes();
    }, []);

    const handleResolve = async (id: string, resolutionType: string) => {
        try {
            const resolutionDetails =
                resolutionType === 'pay_worker'
                    ? 'Adjudicated in favor of Worker. Funds released from Escrow.'
                    : 'Adjudicated in favor of Employer. Funds refunded.';

            await api.post(`/admin/disputes/${id}/resolve`, {
                status: 'resolved',
                resolutionDetails,
            });

            setDisputes((prev) => prev.filter((d) => d._id !== id));
            alert('Dispute successfully resolved on MongoDB!');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to resolve dispute');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Admin Disputes Resolution</h2>
                <p className="text-slate-500 mt-1">Review active conflicts and adjudicate payments securely.</p>
            </header>

            <div className="space-y-4">
                <AnimatePresence>
                    {disputes.length === 0 && (
                        <div className="p-8 text-center bg-emerald-50 text-emerald-600 font-medium rounded-xl border border-emerald-100">
                            <CheckCircle className="w-10 h-10 mx-auto mb-3" />
                            No active disputes remaining. Great job keeping the platform clean!
                        </div>
                    )}
                    {disputes.map(dispute => (
                        <motion.div
                            key={dispute._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, height: 0, margin: 0, overflow: 'hidden' }}
                            className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                                    <h3 className="text-xl font-bold text-slate-800">{dispute.jobId?.title}</h3>
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Open Dispute</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="font-semibold text-slate-800 uppercase tracking-wide text-xs mb-1">Employer</p>
                                        <p>{dispute.employerId?.name}</p>
                                        <p>{dispute.employerId?.phone}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 uppercase tracking-wide text-xs mb-1">Worker</p>
                                        <p>{dispute.workerId?.name}</p>
                                        <p>{dispute.workerId?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 min-w-[250px]">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Escrow Held</span>
                                <span className="text-3xl font-black text-rose-500 mb-6">{dispute.agreedAmount}</span>

                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => handleResolve(dispute._id, 'pay_worker')}
                                        className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
                                    >
                                        Release to Worker
                                    </button>
                                    <button
                                        onClick={() => handleResolve(dispute._id, 'refund_employer')}
                                        className="w-full bg-rose-100 hover:bg-rose-200 text-rose-800 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
                                    >
                                        Refund Employer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AdminDisputes;
