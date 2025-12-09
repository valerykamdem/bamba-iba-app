import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { isTokenExpiringSoon } from './tokenUtils';

// Client HTTP configuré pour communiquer avec votre API backend
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Retry configuration
const MAX_RETRIES = 2;
const retryDelay = (attempt: number) => 500 * Math.pow(2, attempt);
const REFRESH_THRESHOLD = 5 * 60 * 1000;

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Request interceptor - SYNC ONLY (no async/await)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const state = useAuthStore.getState();
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Retry network timeouts (ECONNABORTED only, skip if 401)
    if (
      originalRequest &&
      (!originalRequest.__retryCount || originalRequest.__retryCount < MAX_RETRIES) &&
      error.code === 'ECONNABORTED' &&
      error.response?.status !== 401
    ) {
      originalRequest.__retryCount = (originalRequest.__retryCount || 0) + 1;
      const delay = retryDelay(originalRequest.__retryCount - 1);
      return wait(delay).then(() => apiClient(originalRequest));
    }

    // Handle 401 Unauthorized token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Queue requests if already refreshing
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const state = useAuthStore.getState();
      const refreshToken = state.refreshToken;

      if (!refreshToken) {
        state.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        isRefreshing = false;
        return Promise.reject(error);
      }

      // Use raw axios to avoid interceptor loop
      return axios
        .post(`${apiClient.defaults.baseURL}/auth/refresh-token`, { refreshToken }, {
          timeout: 10000,
        })
        .then((response: any) => {
          const newToken = response.data.token || response.data.access_Token;
          state.setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onRefreshed(newToken);
          refreshSubscribers = [];
          isRefreshing = false;
          console.log('[Auth] Token refreshed');
          return apiClient(originalRequest);
        })
        .catch((refreshError) => {
          console.error('[Auth] Token refresh failed');
          state.logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          isRefreshing = false;
          return Promise.reject(refreshError);
        });
    }

    return Promise.reject(error);
  }
);
