import apiClient from '@/shared/lib/apiClient';
import { Application, ApplicationFormData } from '../types';

export interface ParsedJobData {
    company_name: string;
    role: string;
    job_description: string;
}

export const applicationsService = {
    parseJobUrl: async (url: string): Promise<ParsedJobData> => {
        return apiClient.post<ParsedJobData>('/jobs/parse-url', { url });
    },

    getAll: async (): Promise<Application[]> => {
        return apiClient.get<Application[]>('/applications/');
    },

    getById: async (id: string): Promise<Application> => {
        return apiClient.get<Application>(`/applications/${id}`);
    },

    create: async (data: ApplicationFormData): Promise<Application> => {
        return apiClient.post<Application>('/applications/', data);
    },

    update: async (id: string, data: Partial<ApplicationFormData>): Promise<Application> => {
        return apiClient.put<Application>(`/applications/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return apiClient.delete<void>(`/applications/${id}`);
    },
};

export default applicationsService;
