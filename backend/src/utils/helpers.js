// backend/src/utils/helpers.js - COMPLETO

// 🎯 Utilidades para cálculos y formateo de datos

/**
 * Calcular brecha entre dos valores (RF-10)
 */
const calculateGap = (value1, value2) => {
  if (value1 === null || value2 === null) return null;
  return Math.abs(value1 - value2);
};

/**
 * Calcular porcentaje de brecha
 */
const calculateGapPercentage = (value1, value2) => {
  if (value1 === null || value2 === null || value1 === 0 || value2 === 0) return null;
  const maxValue = Math.max(value1, value2);
  return ((Math.abs(value1 - value2) / maxValue) * 100).toFixed(2);
};

/**
 * Formatear datos para mapa interactivo
 */
const formatMapData = (indicators) => {
  return indicators.map(ind => ({
    region: ind.Region.name,
    code: ind.Region.code,
    value: ind.value,
    coordinates: { 
      lat: ind.Region.latitude, 
      lng: ind.Region.longitude 
    },
    indicator: ind.indicator_name,
    year: ind.year,
    unit: ind.unit,
    metadata: {
      regionId: ind.Region.id,
      indicatorCode: ind.indicator_code
    }
  }));
};

/**
 * Detectar alertas de brechas significativas (>20%)
 */
const detectGapAlerts = (comparisonData) => {
  const alerts = [];
  
  for (let i = 0; i < comparisonData.length; i++) {
    for (let j = i + 1; j < comparisonData.length; j++) {
      const gapPercent = calculateGapPercentage(
        comparisonData[i].value, 
        comparisonData[j].value
      );
      
      if (gapPercent > 20) {
        alerts.push({
          region1: comparisonData[i].region,
          region2: comparisonData[j].region,
          gapPercentage: gapPercent,
          severity: gapPercent > 50 ? 'CRITICA' : 'ALTA',
          message: `Brecha del ${gapPercent}% entre ${comparisonData[i].region} y ${comparisonData[j].region}`
        });
      }
    }
  }
  
  return alerts;
};

/**
 * Formatear datos para gráficos
 */
const formatChartData = (indicators, chartType = 'bar') => {
  switch (chartType) {
    case 'bar':
      return indicators.map(ind => ({
        label: `${ind.Region.name} (${ind.year})`,
        value: ind.value,
        region: ind.Region.name,
        year: ind.year
      }));
    
    case 'line':
      // Agrupar por año para tendencias
      const byYear = {};
      indicators.forEach(ind => {
        if (!byYear[ind.year]) byYear[ind.year] = [];
        byYear[ind.year].push({
          region: ind.Region.name,
          value: ind.value
        });
      });
      return byYear;
    
    case 'pie':
      return indicators.map(ind => ({
        label: ind.Region.name,
        value: ind.value,
        percentage: null // Se calcula después
      }));
    
    default:
      return indicators;
  }
};

/**
 * Validar parámetros de filtro
 */
const validateFilterParams = (filters) => {
  const errors = [];
  
  if (filters.regions && !Array.isArray(filters.regions)) {
    errors.push('El parámetro regions debe ser un array');
  }
  
  if (filters.years) {
    const currentYear = new Date().getFullYear();
    filters.years.forEach(year => {
      if (year < 2000 || year > currentYear) {
        errors.push(`Año ${year} fuera del rango válido`);
      }
    });
  }
  
  if (filters.minValue !== undefined && filters.maxValue !== undefined) {
    if (filters.minValue > filters.maxValue) {
      errors.push('El valor mínimo no puede ser mayor al máximo');
    }
  }
  
  return errors;
};

/**
 * Generar metadata para respuestas API
 */
const generateMetadata = (data, filters = {}) => {
  return {
    timestamp: new Date().toISOString(),
    totalRecords: Array.isArray(data) ? data.length : 1,
    filters: filters,
    version: '1.0.0'
  };
};

module.exports = {
  calculateGap,
  calculateGapPercentage,
  formatMapData,
  detectGapAlerts,
  formatChartData,
  validateFilterParams,
  generateMetadata
};