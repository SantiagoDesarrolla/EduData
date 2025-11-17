// src/pages/Reports.tsx - COMPLETO CON GENERACIÓN DE REPORTES
import { useState } from 'react';
import ReportGenerator from '../components/reports/ReportGenerator';
import FilterPanel, { FilterValues } from '../components/reports/FilterPanel';
import ExportButton from '../components/reports/ExportButton';
import { useIndicators } from '../hooks/useIndicators';

export default function Reports() {
  const { indicators, loading, error } = useIndicators();
  const [filters, setFilters] = useState<FilterValues>({
    regions: [],
    indicators: [],
    years: [2024]
  });

  const filteredData = indicators.filter(indicator => {
    if (filters.regions.length > 0 && !filters.regions.includes(indicator.region_id)) {
      return false;
    }
    if (filters.indicators.length > 0 && !filters.indicators.includes(indicator.indicator_code)) {
      return false;
    }
    if (filters.years.length > 0 && !filters.years.includes(indicator.year)) {
      return false;
    }
    if (filters.minValue !== undefined && indicator.value < filters.minValue) {
      return false;
    }
    if (filters.maxValue !== undefined && indicator.value > filters.maxValue) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generador de Reportes
          </h1>
          <p className="text-lg text-gray-600">
            Crea reportes personalizados, aplica filtros avanzados y exporta tus análisis en múltiples formatos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <FilterPanel 
              onFiltersChange={setFilters}
              initialFilters={filters}
            />
            
            {/* Exportación rápida */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Exportación Rápida</h3>
              <div className="space-y-2">
                <ExportButton
                  data={filteredData}
                  filename="datos_filtrados"
                  format="csv"
                  disabled={filteredData.length === 0}
                />
                <ExportButton
                  data={filteredData}
                  filename="datos_filtrados"
                  format="json"
                  disabled={filteredData.length === 0}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {filteredData.length} registros filtrados
              </div>
            </div>
          </div>

          {/* Generador de reportes y vista previa */}
          <div className="lg:col-span-3 space-y-8">
            <ReportGenerator data={filteredData} />
            
            {/* Vista previa de datos filtrados */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Vista Previa de Datos Filtrados
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredData.length} de {indicators.length} registros
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="mt-2 text-gray-600">Cargando datos...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  Error al cargar los datos: {error}
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos que coincidan con los filtros aplicados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Región
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Indicador
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Año
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredData.slice(0, 10).map((indicator) => (
                        <tr key={indicator.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {indicator.Region?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {indicator.indicator_name}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {indicator.value} {indicator.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {indicator.year}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredData.length > 10 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      Mostrando 10 de {filteredData.length} registros
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}