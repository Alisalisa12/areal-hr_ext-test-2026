import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { AuthUser } from 'src/models/User';



const STORAGE_KEY = 'auth_user';

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadFromStorage(),
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    currentUser: (state): AuthUser | null => state.user,
  },

  actions: {
    setAuth(user: AuthUser) {
      this.user = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    },

    clearAuth() {
      this.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },

    async fetchProfile() {
      try {
        const { data } = await api.get<AuthUser>('/auth/profile');
        this.setAuth(data);
      } catch {
        this.clearAuth();
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout');
      } finally {
        this.clearAuth();
      }
    },
  },
});
