/**
 * Pruebas unitarias para comparación y ETL
 * RF-03: Comparación - Detecta brechas y muestra alertas
 * RF-07: Actualización ETL - Se ejecutan automáticamente
 */

class ComparisonService {
  static compareRegions(regions, indicatorCode, year) {
    const comparison = [];
    regions.forEach(region => {
      comparison.push({
        region: region.name,
        id: region.id,
        value: region.indicators?.[indicatorCode]?.[year] || 0,
      });
    });
    return comparison.sort((a, b) => b.value - a.value);
  }

  static detectGaps(comparisonData, threshold = 20) {
    if (comparisonData.length < 2) return null;

    const values = comparisonData.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const gap = max - min;
    const gapPercentage = (gap / max) * 100;

    if (gapPercentage > threshold) {
      return {
        detected: true,
        gapPercentage: gapPercentage.toFixed(2),
        maxRegion: comparisonData[0].region,
        minRegion: comparisonData[comparisonData.length - 1].region,
        max,
        min,
      };
    }

    return { detected: false, gapPercentage: gapPercentage.toFixed(2) };
  }
}

class ETLService {
  constructor() {
    this.logs = [];
  }

  async runETLProcess(source) {
    const startTime = new Date();
    
    try {
      const data = await this.fetchFromSource(source);
      const transformed = this.transformData(data);
      const loaded = await this.loadData(transformed);

      const log = {
        source,
        status: 'success',
        recordsProcessed: loaded,
        startTime,
        endTime: new Date(),
        duration: new Date() - startTime,
      };

      this.logs.push(log);
      return log;
    } catch (error) {
      const log = {
        source,
        status: 'failed',
        error: error.message,
        startTime,
        endTime: new Date(),
        duration: new Date() - startTime,
      };

      this.logs.push(log);
      throw error;
    }
  }

  async fetchFromSource(source) {
    // Simulated API call
    return Promise.resolve([
      { region: 'Antioquia', year: 2024, indicator: 'cobertura_bruta', value: 85 },
      { region: 'Bogotá', year: 2024, indicator: 'cobertura_bruta', value: 92 },
    ]);
  }

  transformData(data) {
    return data.map(item => ({
      ...item,
      value: parseFloat(item.value),
      processed: true,
    }));
  }

  async loadData(data) {
    // Simulated database load
    return Promise.resolve(data.length);
  }

  getLastLog(source) {
    return this.logs.reverse().find(log => log.source === source);
  }
}

describe('ComparisonService - RF-03', () => {
  const mockRegions = [
    {
      id: 1,
      name: 'Antioquia',
      indicators: {
        cobertura_bruta: { 2024: 85.5 },
      },
    },
    {
      id: 2,
      name: 'Bogotá',
      indicators: {
        cobertura_bruta: { 2024: 95.2 },
      },
    },
    {
      id: 3,
      name: 'Vaupés',
      indicators: {
        cobertura_bruta: { 2024: 62.0 },
      },
    },
  ];

  it('debe ordenar regiones por valor de indicador', () => {
    const result = ComparisonService.compareRegions(mockRegions, 'cobertura_bruta', 2024);

    expect(result[0].region).toBe('Bogotá');
    expect(result[0].value).toBe(95.2);
    expect(result[result.length - 1].region).toBe('Vaupés');
  });

  it('debe detectar brecha cuando supera threshold', () => {
    const comparisonData = [
      { region: 'Bogotá', value: 95.2 },
      { region: 'Vaupés', value: 62.0 },
    ];

    const gap = ComparisonService.detectGaps(comparisonData, 20);

    expect(gap.detected).toBe(true);
    expect(parseFloat(gap.gapPercentage)).toBeGreaterThan(20);
    expect(gap.maxRegion).toBe('Bogotá');
    expect(gap.minRegion).toBe('Vaupés');
  });

  it('no debe detectar brecha cuando no supera threshold', () => {
    const comparisonData = [
      { region: 'Antioquia', value: 85.5 },
      { region: 'Cundinamarca', value: 84.0 },
    ];

    const gap = ComparisonService.detectGaps(comparisonData, 20);

    expect(gap.detected).toBe(false);
  });

  it('debe mostrar alerta cuando se detecta brecha', () => {
    const comparisonData = [
      { region: 'Bogotá', value: 95.2 },
      { region: 'Vaupés', value: 62.0 },
    ];

    const gap = ComparisonService.detectGaps(comparisonData, 20);

    expect(gap).toHaveProperty('maxRegion');
    expect(gap).toHaveProperty('minRegion');
    expect(gap).toHaveProperty('gapPercentage');
  });
});

describe('ETLService - RF-07', () => {
  let etlService;

  beforeEach(() => {
    etlService = new ETLService();
  });

  it('debe ejecutar proceso ETL exitosamente', async () => {
    const log = await etlService.runETLProcess('MEN_API');

    expect(log.status).toBe('success');
    expect(log.recordsProcessed).toBeGreaterThan(0);
    expect(log).toHaveProperty('duration');
    expect(log.duration).toBeGreaterThanOrEqual(0);
  });

  it('debe registrar log con timestamps', async () => {
    const log = await etlService.runETLProcess('DANE_API');

    expect(log.startTime).toBeInstanceOf(Date);
    expect(log.endTime).toBeInstanceOf(Date);
    expect(log.endTime >= log.startTime).toBe(true);
  });

  it('debe recuperar último log por fuente', async () => {
    await etlService.runETLProcess('MEN_API');
    await etlService.runETLProcess('DANE_API');
    await etlService.runETLProcess('MEN_API');

    const lastLog = etlService.getLastLog('MEN_API');

    expect(lastLog.source).toBe('MEN_API');
  });

  it('debe manejar errores en ETL', async () => {
    // Mock de error
    etlService.fetchFromSource = jest.fn().mockRejectedValue(
      new Error('API connection failed')
    );

    await expect(etlService.runETLProcess('FAILED_API')).rejects.toThrow(
      'API connection failed'
    );

    const failedLog = etlService.logs[0];
    expect(failedLog.status).toBe('failed');
    expect(failedLog).toHaveProperty('error');
  });
});
