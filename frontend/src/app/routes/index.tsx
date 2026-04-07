import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from '@/shared/layout/Navbar/Navbar';
import DashboardPage from '@/features/dashboard/pages/DashboardPage/DashboardPage';
import ApplicationsPage from '@/features/applications/pages/ApplicationsPage/ApplicationsPage';
import InsightsPage from '@/features/insights/pages/InsightsPage/InsightsPage';
import ResumesPage from '@/features/resume/pages/ResumesPage/ResumesPage';
import Footer from '@/shared/layout/Footer/Footer';
import LoginPage from '@/features/auth/pages/LoginPage/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage/RegisterPage';
import authService from '@/features/auth/services/auth.service';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <Box as="main" flex="1">
                {children}
            </Box>
            <Footer />
        </>
    );
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <DashboardPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/applications"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ApplicationsPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insights"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <InsightsPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/resumes"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ResumesPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;

