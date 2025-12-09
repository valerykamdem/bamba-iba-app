'use client';

import { useCallback, useState } from 'react';
import { useAuthStore, User } from '@/store/useAuthStore';
import { authApi, LoginRequest, RegisterRequest, AuthResponse } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, setToken, token, _hydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response: AuthResponse = await authApi.login(credentials);
        
        // Mettre à jour le store (qui persiste automatiquement)
        login(response.token, response.user, response.refreshToken);
        toast.success('Connecté avec succès!');
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erreur de connexion';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response: AuthResponse = await authApi.register(data);
        
        // Mettre à jour le store (qui persiste automatiquement)
        login(response.token, response.user, response.refreshToken);
        toast.success('Inscription réussie!');
        
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Erreur lors de l\'inscription';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Déconnecté');
  }, [logout]);

  const handleRefreshToken = useCallback(async () => {
    try {
      const response = await authApi.refreshToken();
      setToken(response.token);
      return response.token;
    } catch (err) {
      handleLogout();
      throw err;
    }
  }, [handleLogout, setToken]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    _hydrated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
  };
};
