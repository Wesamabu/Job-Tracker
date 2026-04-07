import apiClient from '@/shared/lib/apiClient';

const TOKEN_KEY = 'access_token';

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface CurrentUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export const authService = {
    async register(payload: RegisterPayload): Promise<void> {
        const data = await apiClient.post<TokenResponse>('/auth/register', payload);
        localStorage.setItem(TOKEN_KEY, data.access_token);
    },

    async login(payload: LoginPayload): Promise<void> {
        const data = await apiClient.post<TokenResponse>('/auth/login', payload);
        localStorage.setItem(TOKEN_KEY, data.access_token);
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout', {});
        } finally {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    async getMe(): Promise<CurrentUser> {
        return apiClient.get<CurrentUser>('/auth/me');
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    },
};

export default authService;
