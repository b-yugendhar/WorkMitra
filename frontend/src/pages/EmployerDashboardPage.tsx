import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
    Briefcase,
    Users,
    FileCheck,
    Clock,
    CreditCard,
    AlertTriangle,
    PlusCircle,
    RefreshCw,
    TrendingUp,
    CheckCircle2,
    XCircle,
    UserCheck,
    Award
} from 'lucide-react';

interface DashboardStats {
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalApplicants: number;
    pendingApplications: number;
    acceptedWorkers: number;
    activeAgreements: number;
    completedJobs: number;
    pendingWorkApprovals: number;
    pendingPayments: number;
    openDisputes: number;
}

export const EmployerDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchStats = async () => {
        try {
            setError(null);
            const response = await api.get('/dashboard/employer');
            setStats(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load dashboard metrics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Employer Dashboard <TrendingUp className="text-indigo-600 h-7 w-7" />
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Real-time overview of your job postings, candidate applications, active contracts, and payments.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                    <Link
                        to="/employer/create-job"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Post New Job
                    </Link>
                </div>
            </div>

            {/* Error state alert */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <span>{error}</span>
                    </div>
                    <button onClick={handleRefresh} className="text-sm font-semibold underline hover:text-rose-800">
                        Try Again
                    </button>
                </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Jobs */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Jobs Posted</span>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.totalJobs || 0}</p>
                    <div className="flex items-center gap-3 text-xs mt-2 text-gray-500">
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {stats?.openJobs || 0} Open
                        </span>
                        <span>•</span>
                        <span className="text-gray-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> {stats?.closedJobs || 0} Closed
                        </span>
                    </div>
                </div>

                {/* Total Applicants */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Total Applicants</span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.totalApplicants || 0}</p>
                    <div className="flex items-center gap-3 text-xs mt-2 text-gray-500">
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {stats?.pendingApplications || 0} Pending
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <UserCheck className="h-3 w-3" /> {stats?.acceptedWorkers || 0} Accepted
                        </span>
                    </div>
                </div>

                {/* Active Agreements */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Active Contracts</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileCheck className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.activeAgreements || 0}</p>
                    <div className="flex items-center gap-3 text-xs mt-2 text-gray-500">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Award className="h-3 w-3" /> {stats?.completedJobs || 0} Completed
                        </span>
                    </div>
                </div>

                {/* Action Items: Approvals & Payments */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Action Required</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">
                            {(stats?.pendingWorkApprovals || 0) + (stats?.pendingPayments || 0)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">Pending Tasks</span>
                    </div>
                    <div className="text-xs mt-2 space-y-1 text-gray-600">
                        <div>• {stats?.pendingWorkApprovals || 0} Work updates to approve</div>
                        <div>• {stats?.pendingPayments || 0} Pending payouts</div>
                    </div>
                </div>
            </div>

            {/* Secondary Warning Banner for Disputes */}
            {stats && stats.openDisputes > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                        <div>
                            <p className="font-semibold text-amber-900">Attention Required: Open Disputes</p>
                            <p className="text-sm text-amber-700">
                                You currently have {stats.openDisputes} active contract dispute(s) under review.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/employer/disputes"
                        className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        View Disputes
                    </Link>
                </div>
            )}

            {/* Quick Link Navigation Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manage Jobs Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Job Management</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Create, edit, pause, or close your active job listings.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">{stats?.totalJobs || 0} Total Listings</span>
                        <Link
                            to="/employer/jobs"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            Manage Jobs →
                        </Link>
                    </div>
                </div>

                {/* Work Agreements Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <FileCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Work Contracts</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Monitor ongoing work agreements, milestone progress, and completion approvals.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">{stats?.activeAgreements || 0} Active</span>
                        <Link
                            to="/employer/agreements"
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-800"
                        >
                            View Contracts →
                        </Link>
                    </div>
                </div>

                {/* Payments & Payouts Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Payments & Escrow</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Release payments for completed jobs and view your complete billing history.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">{stats?.pendingPayments || 0} Pending</span>
                        <Link
                            to="/employer/payments"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                            Manage Payments →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
