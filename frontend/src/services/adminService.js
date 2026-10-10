import { api } from './api';

export const adminService = {
  async getOverview() {
    return api.get('/admin/overview');
  },

  async getUsers() {
    return api.get('/admin/users');
  },

  async getPharmacies() {
    return api.get('/admin/pharmacies');
  },

  async approvePharmacy(id) {
    return api.post(`/admin/pharmacies/${id}/approve`, {});
  },

  async suspendPharmacy(id) {
    return api.post(`/admin/pharmacies/${id}/suspend`, {});
  },
};
