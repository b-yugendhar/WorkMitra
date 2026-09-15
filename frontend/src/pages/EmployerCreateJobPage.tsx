import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, Clock, Wrench, FileText, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmployerCreateJobPage: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        location: '',
        wage: '',
        duration: '1 Day',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const wageNum = parseFloat(formData.wage);
            if (isNaN(wageNum) || wageNum <= 0) {
                setErrorMessage('Please enter a valid positive wage amount in ₹');
                setIsLoading(false);
                return;
            }

            await api.post('/jobs', {
                title: formData.title,
                description: formData.description,
                requiredSkills: formData.requiredSkills,
                location: formData.location,
                wage: wageNum,
                duration: formData.duration,
            });

            setSuccessMessage('Job posted successfully!');
            setTimeout(() => {
                navigate('/employer/jobs');
            }, 1200);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to post job. Please try again.';
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100"
            >
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Post a New Job Requirement</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Reach verified skilled workers across your location instantly</p>
                    </div>
                </div>

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMessage}</span>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl flex items-center gap-3 font-semibold"
                    >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{successMessage}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Job Title *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Electrical Wiring Specialist Needed for Warehouse"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <Briefcase className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Wage / Pay (₹ in INR) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="100"
                                    step="50"
                                    value={formData.wage}
                                    onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                                    placeholder="e.g. 1500"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                />
                                <IndianRupee className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Expected Duration *
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium appearance-none"
                                >
                                    <option value="1 Day">1 Day</option>
                                    <option value="2-3 Days">2-3 Days</option>
                                    <option value="1 Week">1 Week</option>
                                    <option value="2 Weeks">2 Weeks</option>
                                    <option value="1 Month">1 Month</option>
                                    <option value="Full-Time / Ongoing">Full-Time / Ongoing</option>
                                </select>
                                <Clock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Job Location *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Kukatpally, Hyderabad, Telangana"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Required Skills (comma separated) *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={formData.requiredSkills}
                                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                                placeholder="e.g. Wiring, MCB Installation, Circuit Testing"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <Wrench className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Separate skills with commas to help workers match quickly</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Job Description & Scope *
                        </label>
                        <div className="relative">
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the job duties, working conditions, equipment required, and any specific expectations..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            ></textarea>
                            <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/employer/jobs')}
                            className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                'Posting Job...'
                            ) : (
                                <>
                                    Publish Job
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EmployerCreateJobPage;
