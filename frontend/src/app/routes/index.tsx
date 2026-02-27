import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from '@/shared/layout/Navbar/Navbar';
import DashboardPage from '@/features/dashboard/pages/DashboardPage/DashboardPage';
import ApplicationsPage from '@/features/applications/pages/ApplicationsPage/ApplicationsPage';
import InsightsPage from '@/features/insights/pages/InsightsPage/InsightsPage';
import ResumesPage from '@/features/resume/pages/ResumesPage/ResumesPage';
import Footer from '@/shared/layout/Footer/Footer';

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Box as="main" flex="1">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/resumes" element={<ResumesPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Box>
            <Footer />
        </>
    );
}

export default AppRoutes;
