import { api } from './api';

export const pharmacyService = {
  async getPharmacies(lat = null, lng = null) {
    let url = '/pharmacies';
    if (lat !== null && lng !== null) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    return api.get(url);
  },

  async getPharmacyById(id) {
    return api.get(`/pharmacies/${id}`);
  },

  async getPharmacyMedicines(id) {
    return api.get(`/pharmacies/${id}/medicines`);
  },
};
