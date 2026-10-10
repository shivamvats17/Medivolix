import { api } from './api';

export const requestService = {
  async createRequest(data) {
    return api.post('/availability-requests', data);
  },

  async getMyRequests() {
    return api.get('/availability-requests/my');
  },

  async getRequestById(id) {
    return api.get(`/availability-requests/${id}`);
  },

  async cancelRequest(id) {
    // Backend supports both PATCH and POST /api/availability-requests/{id}/cancel
    return api.patch(`/availability-requests/${id}/cancel`, {});
  },

  async getPharmacyRequests() {
    return api.get('/pharmacy/requests');
  },

  async updatePharmacyRequestStatus(id, status, notes = '') {
    // Backend supports both PATCH and POST /api/pharmacy/requests/{id}/status
    return api.patch(`/pharmacy/requests/${id}/status`, { status, notes });
  },
};
