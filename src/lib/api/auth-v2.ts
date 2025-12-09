import { apiClient } from './client';
import { User } from '@/store/useAuthStore';
import { normalizeAuthResponse } from './authNormalizer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
}

// Service pour les opérations d'authentification
export const authApi = {
  // Se connecter
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', credentials);
    console.log('Raw login response:', response.data);
    const normalized = normalizeAuthResponse(response.data);
    console.log('Normalized login response:', normalized);
    return normalized;
  },

  // S'inscrire
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    console.log('Raw register response:', response.data);
    const normalized = normalizeAuthResponse(response.data);
    console.log('Normalized register response:', normalized);
    return normalized;
  },

  // Rafraîchir le token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const state = (await import('@/store/useAuthStore')).useAuthStore.getState();
    const refreshToken = state.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },
};
