import { api } from './api';

export const inventoryService = {
  async getInventory() {
    return api.get('/pharmacy/inventory');
  },

  async saveInventoryItem(itemData) {
    return api.post('/pharmacy/inventory', itemData);
  },

  async updateInventoryItem(id, itemData) {
    return api.put(`/pharmacy/inventory/${id}`, itemData);
  },

  async markUnavailable(id) {
    return api.post(`/pharmacy/inventory/${id}/unavailable`, {});
  },

  async addBatch(batchData) {
    return api.post('/pharmacy/inventory/batch', batchData);
  },

  async getLowStock() {
    return api.get('/pharmacy/inventory/low-stock');
  },

  async getExpiring() {
    return api.get('/pharmacy/inventory/expiry');
  },

  async getAuditLogs() {
    return api.get('/pharmacy/inventory/audit');
  },
};
