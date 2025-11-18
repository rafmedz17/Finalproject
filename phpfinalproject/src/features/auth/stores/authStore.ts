import { create } from 'zustand';
import { authApi, ApiError } from '@/api/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      toast.success('Login successful');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Login failed';
      set({ isLoading: false, error: errorMessage, isAuthenticated: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup(email, password, name);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      toast.success('Account created successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Signup failed';
      set({ isLoading: false, error: errorMessage, isAuthenticated: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authApi.me();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
