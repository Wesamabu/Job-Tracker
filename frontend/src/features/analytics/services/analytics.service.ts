import apiClient from '@/shared/lib/apiClient';
import { AnalyticsData } from '../types';

export const analyticsService = {
    getAnalytics: async (): Promise<AnalyticsData> => {
        return apiClient.get<AnalyticsData>('/analytics');
    },
};

export default analyticsService;
