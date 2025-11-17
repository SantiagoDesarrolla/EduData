// src/utils/constants.ts - COMPLETO
export const APP_CONSTANTS = {
  APP_NAME: 'EduData',
  VERSION: '1.0.0',
  DEFAULT_YEAR: 2024,
  AVAILABLE_YEARS: [2024, 2023, 2022, 2021, 2020],
};

export const INDICATOR_TYPES = {
  COBERTURA_BRUTA: 'cobertura_bruta',
  COBERTURA_NETA: 'cobertura_neta',
  DESERCION: 'desercion',
  REPROBACION: 'reprobacion',
  APROBACION: 'aprobacion',
  TASA_TERMINACION: 'tasa_terminacion',
} as const;

export const REPORT_TYPES = {
  COMPARISON: 'comparison',
  REGIONAL: 'regional',
  TREND: 'trend',
} as const;

export const FILE_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
} as const;

export const GAP_THRESHOLDS = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 30,
  CRITICAL: 50,
} as const;