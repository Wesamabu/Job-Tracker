export interface DashboardStats {
    totalApplications: number;
    active: number;
    interviews: number;
    offers: number;
}

export interface RecentActivity {
    id: string;
    type: 'application' | 'interview' | 'offer' | 'rejection';
    company: string;
    position: string;
    timestamp: Date;
}
