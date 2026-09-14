import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, CreditCard, LayoutDashboard, Settings, User, Shield, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    // In a real app we derive role from auth context. Using "admin" as mock.
    const userRole = 'admin';

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'My Work', icon: Briefcase, path: '/my-work', role: 'worker' },
        { label: 'Agreements', icon: Briefcase, path: '/agreements', role: 'employer' },
        { label: 'Payments', icon: CreditCard, path: '/payments' },
        { label: 'Profile', icon: User, path: '/profile' },
        { label: 'Admin Dashboard', icon: Shield, path: '/admin', role: 'admin' },
        { label: 'Disputes', icon: ShieldAlert, path: '/admin/disputes', role: 'admin' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0"
        >
            <div className="h-20 flex items-center px-8 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    KaushalSetu
                </h1>
            </div>

            <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
                {navItems.filter(item => !item.role || item.role === userRole || item.role === 'employer' || item.role === 'worker').map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/50'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium tracking-wide">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">Admin User</p>
                        <p className="text-xs text-emerald-400 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
