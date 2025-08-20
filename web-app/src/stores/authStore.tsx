import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting login...', { email });
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('auth_token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('Login successful!', { user });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.error || error.message || 'Login failed',
        isAuthenticated: false,
        user: null,
        token: null,
      });
      localStorage.removeItem('auth_token');
    }
  },
  
  logout: () => {
    console.log('Logout called!');
    localStorage.removeItem('auth_token');
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      error: null,
    });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      set({ 
        token, 
        isAuthenticated: true 
      });
      // TODO: Validate token with backend
    }
  },
}));