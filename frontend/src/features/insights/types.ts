export interface InsightsData {
    totalApplications: number;
    statusBreakdown: Record<string, number>;
    applicationTrend: Array<{
        date: string;
        count: number;
    }>;
}

export interface CareerInsightsData {
    summary: string;
}

export interface SkillItem {
    skill: string;
    matchPercentage: number;
}

export interface SkillThemesData {
    skills: SkillItem[];
}

export interface RoleItem {
    category: string;
    fitLevel: 'Excellent' | 'Good' | 'Moderate' | 'Weak';
    score: number;
}

export interface RoleFitData {
    roles: RoleItem[];
    quickInsight: string;
}
