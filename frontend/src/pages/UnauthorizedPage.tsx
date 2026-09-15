import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleDashboardRedirect = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        switch (user.role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'worker':
                navigate('/my-work');
                break;
            case 'employer':
                navigate('/agreements');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-800/80 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl backdrop-blur-xl"
            >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8" />
                </div>

                <h1 className="text-3xl font-black text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    You do not have the required permissions or role ({user?.role || 'guest'}) to access this page.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleDashboardRedirect}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Go to My Dashboard
                    </button>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Switch Account / Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UnauthorizedPage;
