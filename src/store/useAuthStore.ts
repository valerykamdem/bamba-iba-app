import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
    role?: 'user' | 'moderator' | 'admin';
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    _hydrated: boolean;
    login: (token: string, user: User, refreshToken?: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    setToken: (token: string) => void;
    setHydrated: (hydrated: boolean) => void;
}

// Store pour l'authentification
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            _hydrated: false,

            login: (token, user, refreshToken) => {
                set({ 
                    token, 
                    user, 
                    refreshToken: refreshToken || null,
                    isAuthenticated: true,
                    _hydrated: true,
                });
            },

            logout: () => {
                set({ 
                    token: null, 
                    user: null, 
                    refreshToken: null,
                    isAuthenticated: false,
                    _hydrated: true,
                });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },

            setToken: (token: string) => {
                set({ token });
            },

            setHydrated: (hydrated: boolean) => {
                set({ _hydrated: hydrated });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state._hydrated = true;
                }
            },
        }
    )
);
