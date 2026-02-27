export interface AnalyticsData {
    totalApplications: number;
    statusBreakdown: Record<string, number>;
    applicationTrend: Array<{
        date: string;
        count: number;
    }>;
}
