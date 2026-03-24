import apiClient from '@/shared/lib/apiClient';
import { DashboardStats, RecentActivity } from '../types';

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        return apiClient.get<DashboardStats>('/dashboard/stats');
    },

    async getRecentActivity(): Promise<RecentActivity[]> {
        return apiClient.get<RecentActivity[]>('/dashboard/activity');
    },
};
