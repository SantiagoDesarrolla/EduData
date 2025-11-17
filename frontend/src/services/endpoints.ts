// src/services/endpoints.ts - ARCHIVO FALTANTE
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  
  // Regiones
  REGIONS: {
    BASE: '/regions',
    BY_ID: (id: string | number) => `/regions/${id}`,
  },
  
  // Indicadores
  INDICATORS: {
    BASE: '/indicators',
    MAP: '/indicators/map',
    REGION: (regionId: string | number) => `/indicators/region/${regionId}`,
    COMPARE: '/indicators/compare',
    TRENDS: '/indicators/trends',
    FILTER: '/indicators/filter',
    AVAILABLE: '/indicators/available',
  },
  
  // Datasets
  DATASETS: {
    BASE: '/datasets',
    BY_ID: (id: string | number) => `/datasets/${id}`,
  },
  
  // Reportes
  REPORTS: {
    BASE: '/reports',
    BY_ID: (id: string | number) => `/reports/${id}`,
  },
  
  // ETL
  ETL: {
    LOGS: '/etl-logs',
    RUN: '/etl/run', // Si existe este endpoint
  },
  
  // APIs externas
  API: {
    TEST_CONNECTION: '/api/test-connection',
    MEN_DATA: '/api/men-data',
  },
};

export default ENDPOINTS;