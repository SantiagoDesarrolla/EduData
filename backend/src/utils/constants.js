// backend/src/utils/constants.js - COMPLETO
module.exports = {
  // Roles de usuario
  ROLES: {
    ADMIN: 'admin',
    ANALYST: 'analyst',
    GUEST: 'guest',
  },

  // Tipos de reporte
  REPORT_TYPES: ['comparison', 'regional', 'trend', 'executive'],

  // Formatos de archivo
  FILE_FORMATS: ['pdf', 'csv', 'excel'],

  // Indicadores educativos principales
  MAIN_INDICATORS: {
    COBERTURA_BRUTA: 'cobertura_bruta',
    COBERTURA_NETA: 'cobertura_neta',
    DESERCION: 'desercion',
    REPROBACION: 'reprobacion',
    APROBACION: 'aprobacion',
    TASA_TERMINACION: 'tasa_terminacion'
  },

  // Regiones por defecto (departamentos principales)
  DEFAULT_REGIONS: [
    { id: 1, name: 'Bogotá D.C.', code: '11' },
    { id: 2, name: 'Antioquia', code: '05' },
    { id: 3, name: 'Valle del Cauca', code: '76' },
    { id: 4, name: 'Cundinamarca', code: '25' },
    { id: 5, name: 'Santander', code: '68' }
  ],

  // Años disponibles
  AVAILABLE_YEARS: [2024, 2023, 2022, 2021, 2020],

  // Umbrales para alertas de brechas (RF-10)
  GAP_THRESHOLDS: {
    LOW: 10,
    MEDIUM: 20,
    HIGH: 30,
    CRITICAL: 50
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 1000
  },

  // Mensajes de error estandarizados
  ERROR_MESSAGES: {
    NOT_FOUND: 'Recurso no encontrado',
    UNAUTHORIZED: 'No autorizado',
    VALIDATION_ERROR: 'Error de validación',
    SERVER_ERROR: 'Error interno del servidor'
  }
};