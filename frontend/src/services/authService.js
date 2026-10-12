import { api } from './api';

export const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async logout() {
    try {
      return await api.post('/auth/logout');
    } catch {
      return null;
    }
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async updateProfile(data) {
    return api.put('/auth/profile', data);
  },
};

