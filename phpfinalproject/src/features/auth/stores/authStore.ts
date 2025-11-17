import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'customer' | 'admin') => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string, role: 'customer' | 'admin' = 'customer') => {
    // TODO: Replace with actual API call when Lovable Cloud is connected
    // For now, using mock authentication
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role,
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  signup: async (name: string, email: string, password: string) => {
    // TODO: Replace with actual API call when backend is connected
    // For now, using mock signup - creates user and logs them in
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'customer',
    };
    set({ user: newUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
