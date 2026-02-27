import { api } from '@/shared/lib/apiClient';
import { DashboardStats, RecentActivity } from '../types';

export const dashboardService = {
    // Fetch dashboard statistics
    async getStats(): Promise<DashboardStats> {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },

    // Fetch recent activity
    async getRecentActivity(): Promise<RecentActivity[]> {
        const response = await api.get<RecentActivity[]>('/dashboard/activity');
        return response.data;
    },
};
