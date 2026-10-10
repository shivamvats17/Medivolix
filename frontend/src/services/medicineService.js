import { api } from './api';

export const medicineService = {
  async searchMedicines(query, lat = null, lng = null) {
    let url = `/medicines/search?q=${encodeURIComponent(query || '')}`;
    if (lat !== null && lng !== null) {
      url += `&lat=${lat}&lng=${lng}`;
    }
    return api.get(url);
  },

  async getMedicineById(id, lat = null, lng = null) {
    let url = `/medicines/${id}`;
    if (lat !== null && lng !== null) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    return api.get(url);
  },

  async getAllMedicines() {
    return api.get('/medicines');
  },
};
