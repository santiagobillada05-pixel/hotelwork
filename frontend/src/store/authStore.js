import { create } from 'zustand';
import { authApi } from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return user;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(userData);
      set({ loading: false });
      return response.data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
