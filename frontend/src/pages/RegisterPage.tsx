import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, UserSquare2, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'worker' | 'employer'>('worker');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans py-12">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[150px]"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/15 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-xl mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 rounded-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Join KaushalSetu</h2>
                            <p className="text-slate-400">Create an account to start your journey.</p>
                        </div>

                        {/* Role Selection */}
                        <div className="flex gap-4 mb-8 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 relative">
                            <button
                                onClick={() => setRole('worker')}
                                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all relative z-10 ${role === 'worker' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
                            >
                                <UserSquare2 className={`w-6 h-6 ${role === 'worker' ? 'text-blue-400' : ''}`} />
                                <span className="font-semibold text-sm">I'm a Worker</span>
                            </button>
                            <button
                                onClick={() => setRole('employer')}
                                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all relative z-10 ${role === 'employer' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
                            >
                                <Building2 className={`w-6 h-6 ${role === 'employer' ? 'text-emerald-400' : ''}`} />
                                <span className="font-semibold text-sm">I'm an Employer</span>
                            </button>

                            {/* Animated Background Selector */}
                            <motion.div
                                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-700/50 rounded-xl shadow-inner border border-slate-600/50 z-0"
                                animate={{ left: role === 'worker' ? 6 : 'calc(50% + 0px)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all placeholder-slate-500"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            required
                                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all placeholder-slate-500"
                                            placeholder="+91 9999999999"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all placeholder-slate-500"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all placeholder-slate-500"
                                        placeholder="Create a secure password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 group mt-8"
                            >
                                {isLoading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
                            <p className="text-slate-400 text-sm">
                                Already have an account? <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 ml-1 transition-colors">Sign In Here</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
