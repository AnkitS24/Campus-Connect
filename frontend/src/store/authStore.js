import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => { 
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
      return data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
      return data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch {
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, error: null });
    }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.forgotPassword(email);
      set({ isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.resetPassword({ token, newPassword });
      set({ isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  loadUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
