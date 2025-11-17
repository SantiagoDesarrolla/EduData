// src/services/regionService.ts - COMPLETO
import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { Region } from '../types/region.types';

export const regionService = {
  async getAll(): Promise<Region[] | any> {
    const response = await apiClient.get(API_ENDPOINTS.REGIONS.BASE);
    // Retorna tanto arrays directos como objetos con propiedad 'data'
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async getById(id: number): Promise<Region> {
    const response = await apiClient.get(API_ENDPOINTS.REGIONS.BY_ID(id));
    return response.data;
  },

  async getDepartments(): Promise<Region[]> {
    const allRegions = await this.getAll();
    return (allRegions as Region[]).filter(region => region.type === 'departamento');
  },

  async getMunicipalities(departmentId?: number): Promise<Region[]> {
    const allRegions = await this.getAll();
    return (allRegions as Region[]).filter(region => 
      region.type === 'municipio' && 
      (!departmentId || region.parent_id === departmentId)
    );
  },
};