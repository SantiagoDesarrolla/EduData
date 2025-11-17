// src/services/indicatorService.ts - COMPLETO
import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { Indicator, MapIndicator, ComparisonRequest, FilterRequest } from '../types/indicator.types';

export const indicatorService = {
  // Obtener todos los indicadores con paginación
  async getAll(page = 1, limit = 50, filters?: any) {
    const response = await apiClient.get(API_ENDPOINTS.INDICATORS.BASE, {
      params: { page, limit, ...filters }
    });
    // Retorna tanto arrays directos como objetos con propiedad 'data'
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  // Datos para mapa interactivo (RF-01)
  async getMapData(year?: number, indicator?: string): Promise<MapIndicator[]> {
    const response = await apiClient.get(API_ENDPOINTS.INDICATORS.MAP, {
      params: { year, indicator }
    });
    return response.data;
  },

  // Indicadores por región específica (RF-02)
  async getByRegion(regionId: number, filters?: any) {
    const response = await apiClient.get(
      API_ENDPOINTS.INDICATORS.REGION(regionId), 
      { params: filters }
    );
    return response.data;
  },

  // Comparar regiones (RF-03)
  async compareRegions(data: ComparisonRequest) {
    const response = await apiClient.post(
      API_ENDPOINTS.INDICATORS.COMPARE, 
      data
    );
    return response.data;
  },

  // Tendencias históricas (RF-08)
  async getTrends(regionId: number, indicator: string, startYear?: number, endYear?: number) {
    const response = await apiClient.get(API_ENDPOINTS.INDICATORS.TRENDS, {
      params: { regionId, indicator, startYear, endYear }
    });
    return response.data;
  },

  // Filtros avanzados (RF-09, RF-16)
  async advancedFilter(filters: FilterRequest) {
    const response = await apiClient.post(
      API_ENDPOINTS.INDICATORS.FILTER, 
      filters
    );
    return response.data;
  },

  // Indicadores disponibles
  async getAvailableIndicators() {
    const response = await apiClient.get(API_ENDPOINTS.INDICATORS.AVAILABLE);
    return response.data;
  },
};