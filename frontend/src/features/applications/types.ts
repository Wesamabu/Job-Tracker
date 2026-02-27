export interface Application {
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    status: ApplicationStatus;
    appliedDate: string;
    description?: string;
    notes?: string;
}

export type ApplicationStatus =
    | 'applied'
    | 'interviewing'
    | 'offered'
    | 'rejected'
    | 'accepted';

export interface ApplicationFormData {
    jobTitle: string;
    company: string;
    location?: string;
    status: ApplicationStatus;
    appliedDate: string;
    description?: string;
    notes?: string;
}
