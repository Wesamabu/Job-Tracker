import apiClient from '@/shared/lib/apiClient';
import { InsightsData } from '../types';

export const insightsService = {
    getInsights: async (): Promise<InsightsData> => {
        return apiClient.get<InsightsData>('/insights');
    },
};

export default insightsService;
