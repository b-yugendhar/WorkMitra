import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { LanguageSelector } from './components/LanguageSelector';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import MyWorkPage from './pages/MyWorkPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDisputes from './pages/AdminDisputes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Job Module Pages
import WorkerJobsPage from './pages/WorkerJobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import EmployerCreateJobPage from './pages/EmployerCreateJobPage';
import EmployerManageJobsPage from './pages/EmployerManageJobsPage';

// Worker Module Pages
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { WorkerApplicationsPage } from './pages/WorkerApplicationsPage';
import { WorkerAgreementsPage } from './pages/WorkerAgreementsPage';
import { WorkerPaymentsPage } from './pages/WorkerPaymentsPage';
import { WorkerReviewsPage } from './pages/WorkerReviewsPage';
import { WorkerDisputesPage } from './pages/WorkerDisputesPage';
import { WorkerRecommendationsPage } from './pages/WorkerRecommendationsPage';
import { AIHelpAssistant } from './components/AIHelpAssistant';

// Comprehensive Employer Module Pages
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { EmployerProfilePage } from './pages/EmployerProfilePage';
import { EmployerEditJobPage } from './pages/EmployerEditJobPage';
import { EmployerApplicantsPage } from './pages/EmployerApplicantsPage';
import { EmployerAgreementsPage } from './pages/EmployerAgreementsPage';
import { EmployerAgreementDetailsPage } from './pages/EmployerAgreementDetailsPage';
import { EmployerWorkProgressPage } from './pages/EmployerWorkProgressPage';
import { EmployerPaymentsPage } from './pages/EmployerPaymentsPage';
import { EmployerReviewsPage } from './pages/EmployerReviewsPage';
import { EmployerDisputesPage } from './pages/EmployerDisputesPage';

const RoleBasedRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin" replace />;
        case 'employer':
            return <Navigate to="/employer/dashboard" replace />;
        case 'worker':
        default:
            return <Navigate to="/jobs" replace />;
    }
};

const ProfileRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'worker') {
        return <WorkerProfilePage />;
    }
    return <EmployerProfilePage />;
};

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
                    <LanguageSelector />
                    <NotificationBell />
                </div>

                <AIHelpAssistant />

                <Routes>
                    <Route path="/" element={<RoleBasedRedirect />} />

                    {/* Shared Jobs Routes */}
                    <Route
                        path="/jobs"
                        element={
                            <ProtectedRoute allowedRoles={['worker', 'employer', 'admin']}>
                                <WorkerJobsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/jobs/:id"
                        element={
                            <ProtectedRoute allowedRoles={['worker', 'employer', 'admin']}>
                                <JobDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Worker Module Routes */}
                    <Route
                        path="/worker"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerJobsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/recommendations"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerRecommendationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/jobs"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerJobsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/profile"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/applications"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerApplicationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/agreements"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerAgreementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/payments"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerPaymentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/reviews"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerReviewsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/worker/disputes"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <WorkerDisputesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-work"
                        element={
                            <ProtectedRoute allowedRoles={['worker']}>
                                <MyWorkPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Employer Module Routes */}
                    <Route
                        path="/employer"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/profile"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/jobs"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerManageJobsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/jobs/:id/edit"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerEditJobPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/create-job"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerCreateJobPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/applicants"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerApplicantsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/jobs/:jobId/applicants"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerApplicantsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/agreements"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerAgreementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/agreements/:id"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerAgreementDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/agreements/:id/progress"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerWorkProgressPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/payments"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerPaymentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/reviews"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerReviewsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/employer/disputes"
                        element={
                            <ProtectedRoute allowedRoles={['employer']}>
                                <EmployerDisputesPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Shared Context Routes */}
                    <Route
                        path="/agreements"
                        element={
                            <ProtectedRoute allowedRoles={['employer', 'worker']}>
                                <WorkerAgreementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payments"
                        element={
                            <ProtectedRoute allowedRoles={['worker', 'employer']}>
                                <WorkerPaymentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={['worker', 'employer', 'admin']}>
                                <ProfileRouter />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/disputes"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDisputes />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<RoleBasedRedirect />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <LanguageProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </LanguageProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;