import apiClient from '@/shared/lib/apiClient';
import { InsightsData, CareerInsightsData, SkillThemesData, RoleFitData } from '../types';

type BackendMessageResponse = { message: string };

type BackendSkillThemeItem = {
    skill: string;
    match_percentage: number;
};

type BackendRoleFitItem = {
    role: string;
    match_percentage: number;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

export type FitLevel = 'Excellent' | 'Good' | 'Moderate' | 'Weak';
export type FitColor = 'green' | 'teal' | 'yellow' | 'red';

export const getFitLevelFromPercent = (percent: number): { level: FitLevel; color: FitColor } => {
    if (percent >= 85) return { level: 'Excellent', color: 'green' };
    if (percent >= 70) return { level: 'Good', color: 'teal' };
    if (percent >= 50) return { level: 'Moderate', color: 'yellow' };
    return { level: 'Weak', color: 'red' };
};


export const insightsService = {
    getInsights: async (): Promise<InsightsData> => {
        return apiClient.get<InsightsData>('/insights');
    },

    getCareerInsights: async (): Promise<CareerInsightsData> => {
        return apiClient.get<CareerInsightsData>('/insights/career');
    },

    getSkillThemes: async (): Promise<SkillThemesData> => {
        const response = await apiClient.get<BackendSkillThemeItem[] | BackendMessageResponse>(
            '/insights_service/skillThemes'
        );

        if ('message' in response) {
            return { skills: [] };
        }

        const sorted = [...response].sort((a, b) => b.match_percentage - a.match_percentage);

        const skills = sorted.map((item) => {
            const percent = clampPercent(item.match_percentage);
            return {
                skill: item.skill,
                matchPercentage: percent,
            };
        });

        return { skills };
    },

    getRoleFit: async (): Promise<RoleFitData> => {
        const response = await apiClient.get<BackendRoleFitItem[] | BackendMessageResponse>(
            '/insights_service/roleFit'
        );
        if (!Array.isArray(response)) {
            return { roles: [], quickInsight: '' };
        }
        const roles = response.map((item) => {
            const percent = clampPercent(item.match_percentage);
            const { level } = getFitLevelFromPercent(percent);
            return { category: item.role, fitLevel: level, score: percent / 100 };
        });
        const topRole = roles[0];
        const quickInsight = topRole
            ? `Your strongest current alignment is ${topRole.category} (${Math.round(topRole.score * 100)}%).`
            : '';
        return { roles, quickInsight };
    
    },
};

export default insightsService;
