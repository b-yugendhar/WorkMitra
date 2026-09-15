import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Phone,
    Lock,
    ArrowRight,
    ShieldCheck,
    Briefcase,
    Zap,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [credentials, setCredentials] = useState({
        phone: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsLoading(true);
        setErrorMessage('');

        try {
            const user = await login(credentials);

            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'worker') {
                navigate('/my-work');
            } else if (user.role === 'employer') {
                navigate('/agreements');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                'Login failed. Please check your phone number and password.';

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/15 blur-[100px]" />
            </div>

            <div className="w-full max-w-6xl mx-auto px-6 z-10 flex gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:flex flex-col flex-1 text-white pr-12"
                >
                    <h1 className="text-5xl font-black mb-6 leading-tight">
                        Empowering Blue-Collar
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Workforces.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg mb-12 max-w-md">
                        WorkMitra connects skilled workers with verified
                        employers through trusted digital agreements.
                    </p>

                    <div className="space-y-6">
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'Verified Profiles',
                                desc: 'Trusted worker and employer accounts.',
                            },
                            {
                                icon: Zap,
                                title: 'Easy Job Discovery',
                                desc: 'Find suitable work opportunities.',
                            },
                            {
                                icon: Briefcase,
                                title: 'Secure Agreements',
                                desc: 'Manage work and payments securely.',
                            },
                        ].map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-emerald-400" />
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-200">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400">
                            Sign in to your WorkMitra account.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-5 rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-sm text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Phone Number
                            </label>

                            <div className="relative">
                                <input
                                    type="tel"
                                    required
                                    value={credentials.phone}
                                    onChange={(event) =>
                                        setCredentials({
                                            ...credentials,
                                            phone: event.target.value,
                                        })
                                    }
                                    placeholder="Enter your phone number"
                                    className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={credentials.password}
                                    onChange={(event) =>
                                        setCredentials({
                                            ...credentials,
                                            password: event.target.value,
                                        })
                                    }
                                    placeholder="Enter your password"
                                    className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'Signing in...'
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
                        <p className="text-slate-400 text-sm">
                            Do not have an account?{' '}
                            <Link
                                to="/register"
                                className="text-emerald-400 font-semibold"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;