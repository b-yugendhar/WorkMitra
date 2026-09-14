import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Briefcase, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/15 blur-[100px]"></div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-6 z-10 flex gap-12 items-center">
                {/* Left Side: Marketing / Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-col flex-1 text-white pr-12"
                >
                    <h1 className="text-5xl font-black mb-6 leading-tight">
                        Empowering Blue-Collar <br />
                        <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Workforces.</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-12 max-w-md">
                        KaushalSetu connects skilled workers with verified employers ensuring trust, secure payments, and professional growth.
                    </p>

                    <div className="space-y-6">
                        {[
                            { icon: ShieldCheck, title: "Verified Profiles", desc: "AI-driven skill verification & background checks." },
                            { icon: Zap, title: "Instant Discoverability", desc: "Match seamlessly with jobs based on your exact skills." },
                            { icon: Briefcase, title: "Escrow Protected", desc: "Agreements and payments secured natively on-platform." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                                className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center border border-blue-500/30">
                                    <feature.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{feature.title}</h4>
                                    <p className="text-sm text-slate-500">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 rounded-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">Sign in to your KaushalSetu account.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all placeholder-slate-500"
                                        placeholder="Enter your email"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
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
                                        placeholder="Enter your password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 group mt-6"
                            >
                                {isLoading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
                            <p className="text-slate-400 text-sm">
                                Don't have an account? <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 ml-1 transition-colors">Create Account</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
