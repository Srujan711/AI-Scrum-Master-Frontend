import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../services/api';
import { useTeamStore } from './teamStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password);
          const { access_token, user } = response;

          localStorage.setItem('auth_token', access_token);
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Auto-select first team if available
          if (user.teams && user.teams.length > 0) {
            const firstTeam = user.teams[0];
            const { setCurrentTeam } = useTeamStore.getState();
            setCurrentTeam({
              id: firstTeam.id,
              name: firstTeam.name,
              is_active: firstTeam.is_active,
              description: '',
              standup_time: '09:00',
              standup_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              sprint_length: 14,
              ai_enabled: true,
              auto_standup: true,
              auto_backlog_grooming: false
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        authApi.logout().catch(console.error);
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      getCurrentUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            token,
            isAuthenticated: true,
          });

          // Auto-select first team if available
          if (user.teams && user.teams.length > 0) {
            const firstTeam = user.teams[0];
            const { setCurrentTeam } = useTeamStore.getState();
            setCurrentTeam({
              id: firstTeam.id,
              name: firstTeam.name,
              is_active: firstTeam.is_active,
              description: '',
              standup_time: '09:00',
              standup_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              sprint_length: 14,
              ai_enabled: true,
              auto_standup: true,
              auto_backlog_grooming: false
            });
          }
        } catch (error) {
          // Token is invalid, clear auth state
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
      
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
