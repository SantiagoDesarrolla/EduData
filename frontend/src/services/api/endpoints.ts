// src/services/api/endpoints.ts
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  
  // Datos principales
  INDICATORS: {
    BASE: '/indicators',
    MAP: '/indicators/map',
    REGION: (regionId: number) => `/indicators/region/${regionId}`,
    COMPARE: '/indicators/compare',
    TRENDS: '/indicators/trends',
    FILTER: '/indicators/filter',
    AVAILABLE: '/indicators/available',
  },
  
  REGIONS: {
    BASE: '/regions',
    BY_ID: (id: number) => `/regions/${id}`,
  },
  
  REPORTS: {
    BASE: '/reports',
    BY_ID: (id: number) => `/reports/${id}`,
  },
  
  DATASETS: {
    BASE: '/datasets',
    BY_ID: (id: number) => `/datasets/${id}`,
  },
  
  ETL: {
    BASE: '/etl-logs',
    BY_ID: (id: number) => `/etl-logs/${id}`,
  },
};