/**
 * Pruebas unitarias para filtros y alertas de brechas
 * RF-09: Filtros - Filtrado avanzado funciona
 * RF-10: Alertas brechas - Detecta y notifica brechas >20%
 */

class DataFilterService {
  static filterByRegion(data, regionId) {
    return data.filter(item => item.region_id === parseInt(regionId));
  }

  static filterByYear(data, year) {
    return data.filter(item => item.year === parseInt(year));
  }

  static filterByIndicator(data, indicatorCode) {
    return data.filter(item => item.indicator_code === indicatorCode);
  }

  static applyMultipleFilters(data, filters) {
    let result = data;
    if (filters.regionId) result = this.filterByRegion(result, filters.regionId);
    if (filters.year) result = this.filterByYear(result, filters.year);
    if (filters.indicatorCode) result = this.filterByIndicator(result, filters.indicatorCode);
    return result;
  }
}

class AlertService {
  static detectGapAlerts(data, threshold = 20) {
    const regions = {};
    
    // Agrupar por indicador
    data.forEach(item => {
      if (!regions[item.indicator_code]) {
        regions[item.indicator_code] = [];
      }
      regions[item.indicator_code].push(item);
    });

    // Detectar brechas
    const alerts = [];
    Object.entries(regions).forEach(([indicatorCode, items]) => {
      if (items.length >= 2) {
        const values = items.map(i => i.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const gap = max - min;

        if (gap > threshold) {
          alerts.push({
            indicatorCode,
            gap: gap.toFixed(2),
            maxRegion: items.find(i => i.value === max)?.region_name,
            minRegion: items.find(i => i.value === min)?.region_name,
            severity: gap > 50 ? 'critical' : gap > 30 ? 'high' : 'medium',
          });
        }
      }
    });

    return alerts;
  }
}

describe('DataFilterService - RF-09', () => {
  const mockData = [
    { region_id: 1, year: 2024, indicator_code: 'cobertura_bruta', value: 85.5 },
    { region_id: 1, year: 2023, indicator_code: 'cobertura_bruta', value: 83.2 },
    { region_id: 2, year: 2024, indicator_code: 'cobertura_bruta', value: 90.1 },
    { region_id: 2, year: 2024, indicator_code: 'tasa_desercion', value: 12.5 },
  ];

  it('debe filtrar por región', () => {
    const result = DataFilterService.filterByRegion(mockData, 1);
    expect(result).toHaveLength(2);
    expect(result[0].region_id).toBe(1);
  });

  it('debe filtrar por año', () => {
    const result = DataFilterService.filterByYear(mockData, 2024);
    expect(result).toHaveLength(3);
    expect(result[0].year).toBe(2024);
  });

  it('debe filtrar por indicador', () => {
    const result = DataFilterService.filterByIndicator(mockData, 'cobertura_bruta');
    expect(result).toHaveLength(3);
    expect(result[0].indicator_code).toBe('cobertura_bruta');
  });

  it('debe aplicar múltiples filtros', () => {
    const result = DataFilterService.applyMultipleFilters(mockData, {
      regionId: 1,
      year: 2024,
      indicatorCode: 'cobertura_bruta',
    });
    expect(result).toHaveLength(1);
    expect(result[0].region_id).toBe(1);
    expect(result[0].year).toBe(2024);
  });
});

describe('AlertService - RF-10', () => {
  it('debe detectar brechas mayor a 20%', () => {
    const mockData = [
      { indicator_code: 'cobertura_bruta', value: 90, region_name: 'Antioquia' },
      { indicator_code: 'cobertura_bruta', value: 65, region_name: 'Vaupés' },
      { indicator_code: 'cobertura_bruta', value: 88, region_name: 'Cundinamarca' },
    ];

    const alerts = AlertService.detectGapAlerts(mockData, 20);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].gap).toBe('25.00');
    expect(alerts[0].severity).toBe('medium');
  });

  it('debe clasificar brecha crítica (>50%)', () => {
    const mockData = [
      { indicator_code: 'cobertura_bruta', value: 95, region_name: 'Bogotá' },
      { indicator_code: 'cobertura_bruta', value: 40, region_name: 'Vaupés' },
    ];

    const alerts = AlertService.detectGapAlerts(mockData, 20);

    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].gap).toBe('55.00');
  });

  it('no debe reportar brechas menores a threshold', () => {
    const mockData = [
      { indicator_code: 'cobertura_bruta', value: 85, region_name: 'Antioquia' },
      { indicator_code: 'cobertura_bruta', value: 82, region_name: 'Caldas' },
    ];

    const alerts = AlertService.detectGapAlerts(mockData, 20);

    expect(alerts).toHaveLength(0);
  });
});
