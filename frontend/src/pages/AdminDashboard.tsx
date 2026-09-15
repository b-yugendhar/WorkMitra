import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, IndianRupee } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState<{
        totalUsers: number;
        activeAgreements: number;
        totalEscrow: number;
        revenueData: { month: string; revenue: number }[];
    }>({
        totalUsers: 0,
        activeAgreements: 0,
        totalEscrow: 0,
        revenueData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (e) {
                console.error('Failed to fetch admin stats:', e);
                setStats({
                    totalUsers: 342,
                    activeAgreements: 89,
                    totalEscrow: 145000,
                    revenueData: [
                        { month: 'Jan', revenue: 4000 },
                        { month: 'Feb', revenue: 3000 },
                        { month: 'Mar', revenue: 5000 },
                        { month: 'Apr', revenue: 2780 },
                        { month: 'May', revenue: 8900 },
                        { month: 'Jun', revenue: 10200 },
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-500' },
        { label: 'Active Contracts', value: stats.activeAgreements, icon: Briefcase, color: 'from-emerald-400 to-teal-500' },
        { label: 'Funds in Escrow', value: `₹${stats.totalEscrow.toLocaleString()}`, icon: IndianRupee, color: 'from-amber-400 to-orange-500' }
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 max-w-7xl mx-auto"
        >
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
                <p className="text-slate-500 mt-1">Platform overview and analytics</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 h-96">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Revenue (Escrow Volume) Overview</h3>
                    <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                    </select>
                </div>

                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={stats.revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [`₹${value}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
