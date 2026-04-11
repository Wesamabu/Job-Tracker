import apiClient from '@/shared/lib/apiClient';
import { InsightsData, CareerInsightsData, SkillThemesData, RoleFitData } from '../types';

export const insightsService = {
    getInsights: async (): Promise<InsightsData> => {
        return apiClient.get<InsightsData>('/insights');
    },

    getCareerInsights: async (): Promise<CareerInsightsData> => {
        return apiClient.get<CareerInsightsData>('/insights/career');
    },

    getSkillThemes: async (): Promise<SkillThemesData> => {
        // return apiClient.get<SkillThemesData>('/insights/skill-themes');
        return Promise.resolve({
            skills: [
                { skill: 'Backend Development', demandLevel: 'High', yourAlignment: 'Strong' },
                { skill: 'Data Analysis', demandLevel: 'Medium', yourAlignment: 'Moderate' },
                { skill: 'Cloud Platforms', demandLevel: 'High', yourAlignment: 'Weak' },
                { skill: 'Machine Learning', demandLevel: 'Medium', yourAlignment: 'Weak' },
                { skill: 'DevOps & Deployment', demandLevel: 'Low', yourAlignment: 'Moderate' },
                { skill: 'UI/UX Design', demandLevel: 'Low', yourAlignment: 'Weak' },
                { skill: 'System Design', demandLevel: 'High', yourAlignment: 'Moderate' },
                { skill: 'Project Management', demandLevel: 'Medium', yourAlignment: 'Strong' },
            ],
            improvementTips: [
                'Add at least one cloud-based project (AWS, GCP, or Azure) to your resume.',
                'Include any ML or data pipeline experience, even if academic or personal projects.',
                'Highlight system design experience — mention scalability and architecture decisions.',
            ],
        });
    },

    getRoleFit: async (): Promise<RoleFitData> => {
        // return apiClient.get<RoleFitData>('/insights/role-fit');
        return Promise.resolve({
            roles: [
                { category: 'Backend / SWE',       fitLevel: 'Excellent', score: 0.87 },
                { category: 'Data / Analytics',    fitLevel: 'Good',      score: 0.73 },
                { category: 'DevOps & Cloud',       fitLevel: 'Moderate',  score: 0.58 },
                { category: 'Machine Learning / AI', fitLevel: 'Weak',    score: 0.41 },
            ],
            quickInsight:
                'Your resume aligns best with Backend / SWE roles, which also show the highest response rate among your applications.',
        });
    },
};

export default insightsService;
