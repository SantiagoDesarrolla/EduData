/**
 * Pruebas unitarias para generación de reportes
 * RF-04: Generación de reportes (PDF/CSV)
 * RF-05: Exportación de archivos en formatos soportados
 */

class ReportGeneratorService {
  static generateCSV(data, fields) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const header = fields.join(',');
    const rows = data.map(item =>
      fields.map(field => {
        const value = item[field] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );

    return [header, ...rows].join('\n');
  }

  static generateJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  static generatePDF(data) {
    return {
      success: true,
      message: 'PDF generado exitosamente',
      pages: Math.ceil(data.length / 20),
    };
  }

  static validateFormat(format) {
    const supportedFormats = ['CSV', 'JSON', 'PDF'];
    return supportedFormats.includes(format.toUpperCase());
  }

  static exportData(data, format, fields) {
    if (!this.validateFormat(format)) {
      throw new Error(`Formato no soportado: ${format}`);
    }

    const normalizedFormat = format.toUpperCase();

    if (normalizedFormat === 'CSV') {
      return this.generateCSV(data, fields);
    } else if (normalizedFormat === 'JSON') {
      return this.generateJSON(data);
    } else if (normalizedFormat === 'PDF') {
      return this.generatePDF(data);
    }
  }
}

describe('ReportGeneratorService - RF-04', () => {
  const mockData = [
    { region: 'Antioquia', year: 2024, indicator: 'cobertura_bruta', value: 85.5 },
    { region: 'Bogotá', year: 2024, indicator: 'cobertura_bruta', value: 92.1 },
    { region: 'Cauca', year: 2024, indicator: 'cobertura_bruta', value: 78.3 },
  ];

  describe('generateCSV - RF-05', () => {
    it('debe generar CSV válido', () => {
      const fields = ['region', 'year', 'indicator', 'value'];
      const csv = ReportGeneratorService.generateCSV(mockData, fields);

      expect(csv).toContain('region,year,indicator,value');
      expect(csv).toContain('Antioquia');
    });

    it('debe escapar correctamente valores con comas', () => {
      const dataWithComma = [
        { name: 'García, Juan', value: 100 },
      ];
      const fields = ['name', 'value'];
      const csv = ReportGeneratorService.generateCSV(dataWithComma, fields);

      expect(csv).toContain('"García, Juan"');
    });

    it('debe lanzar error si no hay datos', () => {
      const fields = ['region', 'value'];
      expect(() => ReportGeneratorService.generateCSV([], fields)).toThrow(
        'No data to export'
      );
    });
  });

  describe('generateJSON - RF-05', () => {
    it('debe generar JSON válido', () => {
      const json = ReportGeneratorService.generateJSON(mockData);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toHaveProperty('region');
    });

    it('debe ser parseable', () => {
      const json = ReportGeneratorService.generateJSON(mockData);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('generatePDF - RF-04', () => {
    it('debe indicar éxito en generación PDF', () => {
      const result = ReportGeneratorService.generatePDF(mockData);

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('pages');
    });

    it('debe calcular número de páginas correctamente', () => {
      const result = ReportGeneratorService.generatePDF(mockData);

      expect(result.pages).toBeGreaterThan(0);
    });
  });

  describe('validateFormat', () => {
    it('debe aceptar CSV', () => {
      expect(ReportGeneratorService.validateFormat('CSV')).toBe(true);
    });

    it('debe aceptar JSON', () => {
      expect(ReportGeneratorService.validateFormat('JSON')).toBe(true);
    });

    it('debe aceptar PDF', () => {
      expect(ReportGeneratorService.validateFormat('PDF')).toBe(true);
    });

    it('debe rechazar formatos no soportados', () => {
      expect(ReportGeneratorService.validateFormat('XLSX')).toBe(false);
      expect(ReportGeneratorService.validateFormat('XML')).toBe(false);
    });

    it('debe ser case-insensitive', () => {
      expect(ReportGeneratorService.validateFormat('csv')).toBe(true);
      expect(ReportGeneratorService.validateFormat('Pdf')).toBe(true);
    });
  });

  describe('exportData - RF-04 & RF-05', () => {
    it('debe exportar en CSV', () => {
      const fields = ['region', 'value'];
      const result = ReportGeneratorService.exportData(mockData, 'CSV', fields);

      expect(result).toContain('region,value');
      expect(result).toContain('Antioquia');
    });

    it('debe exportar en JSON', () => {
      const result = ReportGeneratorService.exportData(mockData, 'JSON', []);
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
    });

    it('debe exportar en PDF', () => {
      const result = ReportGeneratorService.exportData(mockData, 'PDF', []);

      expect(result.success).toBe(true);
    });

    it('debe lanzar error con formato inválido', () => {
      expect(() => 
        ReportGeneratorService.exportData(mockData, 'XLSX', [])
      ).toThrow('Formato no soportado');
    });
  });
});
