import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    Phone,
    ArrowRight,
    UserSquare2,
    Building2,
    User,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [role, setRole] = useState<'worker' | 'employer'>('worker');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        preferredLanguage: 'en',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setIsLoading(true);
        setErrorMessage('');

        try {
            const user = await register({
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role,
                preferredLanguage: formData.preferredLanguage,
            });

            if (user.role === 'worker') {
                navigate('/my-work');
            } else if (user.role === 'employer') {
                navigate('/agreements');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                'Registration failed. Please try again.';

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Join WorkMitra
                    </h2>

                    <p className="text-slate-400">
                        Create your account to get started.
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-5 rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                    </div>
                )}

                <div className="flex gap-4 mb-8 bg-slate-800/50 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setRole('worker')}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${role === 'worker'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <UserSquare2 className="w-6 h-6" />
                        <span className="font-semibold text-sm">
                            I am a Worker
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole('employer')}
                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${role === 'employer'
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Building2 className="w-6 h-6" />
                        <span className="font-semibold text-sm">
                            I am an Employer
                        </span>
                    </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Full Name
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        fullName: event.target.value,
                                    })
                                }
                                placeholder="Enter your full name"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Phone Number
                        </label>

                        <div className="relative">
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        phone: event.target.value,
                                    })
                                }
                                placeholder="Enter your phone number"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address (Optional)
                        </label>

                        <div className="relative">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        email: event.target.value,
                                    })
                                }
                                placeholder="Enter your email"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
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
                                minLength={6}
                                value={formData.password}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        password: event.target.value,
                                    })
                                }
                                placeholder="Minimum 6 characters"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            'Creating account...'
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-400 font-semibold"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;