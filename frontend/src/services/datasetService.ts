// src/services/datasetService.ts - COMPLETO
import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/endpoints';

export const datasetService = {
  async getAll() {
    const response = await apiClient.get(API_ENDPOINTS.DATASETS.BASE);
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(API_ENDPOINTS.DATASETS.BY_ID(id));
    return response.data;
  },

  async create(data: any) {
    const response = await apiClient.post(API_ENDPOINTS.DATASETS.BASE, data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await apiClient.put(API_ENDPOINTS.DATASETS.BY_ID(id), data);
    return response.data;
  },

  async delete(id: number) {
    await apiClient.delete(API_ENDPOINTS.DATASETS.BY_ID(id));
  },
};