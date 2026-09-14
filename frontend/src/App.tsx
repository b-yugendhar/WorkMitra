import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';

import AgreementsPage from './pages/AgreementsPage';
import MyWorkPage from './pages/MyWorkPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDisputes from './pages/AdminDisputes';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { LayoutDashboard } from 'lucide-react';

const DashboardHome = () => (
    <div className="p-8">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-800">
                Platform Dashboard
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Active Jobs', 'Total Earnings', 'Profile Views'].map(
                (item, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-slate-500 text-sm font-medium">
                                {item}
                            </p>

                            <h3 className="text-2xl font-bold text-slate-800">
                                {i === 1 ? '₹45,200' : i * 14 + 7}
                            </h3>
                        </div>
                    </div>
                )
            )}
        </div>
    </div>
);

const DashboardLayout = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="absolute top-8 right-8 z-50">
                    <Routes>
                        <Route
                            path="/"
                            element={<div className="hidden" />}
                        />
                        <Route
                            path="*"
                            element={<NotificationBell />}
                        />
                    </Routes>
                </div>

                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route
                        path="/agreements"
                        element={<AgreementsPage />}
                    />
                    <Route path="/my-work" element={<MyWorkPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route
                        path="/admin/disputes"
                        element={<AdminDisputes />}
                    />

                    <Route
                        path="*"
                        element={
                            <div className="p-8 text-center text-slate-500 mt-20">
                                Page under construction via Phase 6/7 rollout
                            </div>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/*" element={<DashboardLayout />} />
            </Routes>
        </Router>
    );
}

export default App;