// src/utils/formatters.ts - COMPLETO
export const formatters = {
  // Formatear números con separadores de miles
  formatNumber: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO').format(value);
  },

  // Formatear porcentajes
  formatPercentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  },

  // Formatear fechas
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO').format(date);
  },

  // Formatear nombre de indicador para mostrar
  formatIndicatorName: (code: string): string => {
    const names: Record<string, string> = {
      'cobertura_bruta': 'Cobertura Bruta',
      'cobertura_neta': 'Cobertura Neta',
      'desercion': 'Tasa de Deserción',
      'reprobacion': 'Tasa de Reprobación',
      'aprobacion': 'Tasa de Aprobación',
      'tasa_terminacion': 'Tasa de Terminación',
    };
    return names[code] || code.replace(/_/g, ' ').toUpperCase();
  },

  // Formatear nombre de región
  formatRegionName: (name: string): string => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
};