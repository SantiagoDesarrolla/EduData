// src/components/reports/ReportGenerator.tsx - GENERADOR DE REPORTES
import { useState } from 'react';
import Button from '../ui/Button';

interface ReportGeneratorProps {
  data?: any[];
}

export default function ReportGenerator({ data = [] }: ReportGeneratorProps) {
  const [reportName, setReportName] = useState('Reporte Personalizado');
  const [reportType, setReportType] = useState('indicadores');
  const [generated, setGenerated] = useState(false);

  const handleGenerateReport = () => {
    if (!reportName.trim()) {
      alert('Por favor ingresa un nombre para el reporte');
      return;
    }
    setGenerated(true);
    setTimeout(() => {
      alert(`Reporte "${reportName}" generado exitosamente`);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Reporte</h2>
      
      <div className="space-y-4">
        {/* Nombre del reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Reporte
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Análisis Regional 2024"
          />
        </div>

        {/* Tipo de reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Reporte
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="indicadores">Indicadores Educativos</option>
            <option value="comparativo">Análisis Comparativo</option>
            <option value="tendencias">Tendencias Históricas</option>
            <option value="regional">Análisis Regional</option>
          </select>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-sm text-gray-600">Registros seleccionados</div>
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="text-sm text-gray-600">Estado</div>
            <div className="text-2xl font-bold text-green-600">
              {generated ? '✓' : 'Listo'}
            </div>
          </div>
        </div>

        {/* Botón de generación */}
        <Button
          onClick={handleGenerateReport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Generar Reporte
        </Button>
      </div>
    </div>
  );
}