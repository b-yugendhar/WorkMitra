import { NavLink, useNavigate } from 'react-router-dom';
import {
    PlusCircle,
    ListFilter,
    CreditCard,
    User,
    Shield,
    ShieldAlert,
    LogOut,
    Search,
    LayoutDashboard,
    Users,
    FileCheck,
    Star,
    FileText,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const userRole = user?.role || 'worker';
    const displayName = user?.fullName || user?.phone || 'User';

    const navItems = [
        // Worker links
        { label: 'AI Job Matches', icon: Sparkles, path: '/worker/recommendations', role: 'worker' },
        { label: 'Available Jobs', icon: Search, path: '/worker/jobs', role: 'worker' },
        { label: 'My Applications', icon: FileText, path: '/worker/applications', role: 'worker' },
        { label: 'Work Contracts', icon: FileCheck, path: '/worker/agreements', role: 'worker' },
        { label: 'Work Progress', icon: TrendingUp, path: '/my-work', role: 'worker' },
        { label: 'Payments & Payouts', icon: CreditCard, path: '/worker/payments', role: 'worker' },
        { label: 'Ratings & Reviews', icon: Star, path: '/worker/reviews', role: 'worker' },
        { label: 'Dispute Protection', icon: ShieldAlert, path: '/worker/disputes', role: 'worker' },
        { label: 'My Profile', icon: User, path: '/worker/profile', role: 'worker' },

        // Employer links
        { label: 'Dashboard', icon: LayoutDashboard, path: '/employer/dashboard', role: 'employer' },
        { label: 'Post a Job', icon: PlusCircle, path: '/employer/create-job', role: 'employer' },
        { label: 'Manage Jobs', icon: ListFilter, path: '/employer/jobs', role: 'employer' },
        { label: 'Applicants', icon: Users, path: '/employer/applicants', role: 'employer' },
        { label: 'Contracts', icon: FileCheck, path: '/employer/agreements', role: 'employer' },
        { label: 'Payments', icon: CreditCard, path: '/employer/payments', role: 'employer' },
        { label: 'Reviews', icon: Star, path: '/employer/reviews', role: 'employer' },
        { label: 'Disputes', icon: ShieldAlert, path: '/employer/disputes', role: 'employer' },
        { label: 'Company Profile', icon: User, path: '/employer/profile', role: 'employer' },

        // Admin links
        { label: 'Admin Dashboard', icon: Shield, path: '/admin', role: 'admin' },
        { label: 'Disputes Adjudication', icon: ShieldAlert, path: '/admin/disputes', role: 'admin' },
    ];

    const visibleItems = navItems.filter((item) => !item.role || item.role === userRole);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 font-sans"
        >
            <div className="h-20 flex items-center px-8 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    WorkMitra
                </h1>
            </div>

            <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
                {visibleItems.map((item, index) => (
                    <NavLink
                        key={`${item.path}-${index}`}
                        to={item.path}
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm ${isActive
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold shadow-md shadow-indigo-950'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                            }`
                        }
                    >
                        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700/50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0 text-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-emerald-400 capitalize font-medium">{userRole}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold transition-colors border border-rose-500/20"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
