// src/pages/Dashboard.tsx - COMPLETO CON COMPONENTES INTEGRADOS
import { useState } from 'react';
import InteractiveMap from '../components/maps/InteractiveMap';
import IndicatorChart from '../components/charts/IndicatorChart';
import { useRegions } from '../hooks/useRegions';
import { useIndicators } from '../hooks/useIndicators';

export default function Dashboard() {
  const { regions, loading: loadingRegions, error: errorRegions } = useRegions();
  const { indicators, loading: loadingIndicators, error: errorIndicators } = useIndicators();
  const [activeTab, setActiveTab] = useState<'map' | 'charts' | 'overview'>('overview');

  if (loadingRegions || loadingIndicators) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-blue-600 font-semibold">Cargando datos del dashboard...</div>
      </div>
    );
  }

  if (errorRegions || errorIndicators) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-red-600 font-semibold">
          Error al cargar datos: {errorRegions || errorIndicators}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard EduData
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Visualización interactiva de indicadores educativos en Colombia
              </p>
            </div>
            
            {/* Navegación por pestañas */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Resumen', icon: '📊' },
                { id: 'map', label: 'Mapa', icon: '🗺️' },
                { id: 'charts', label: 'Gráficos', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏛️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Regiones</div>
                    <div className="text-2xl font-semibold text-gray-900">{regions.length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📈</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Indicadores</div>
                    <div className="text-2xl font-semibold text-gray-900">{indicators.length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Años Activos</div>
                    <div className="text-2xl font-semibold text-gray-900">5</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Actualizado</div>
                    <div className="text-lg font-semibold text-gray-900">Hoy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa rápido y gráfico rápido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Rápida del Mapa</h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <button 
                    onClick={() => setActiveTab('map')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Abrir Mapa Interactivo
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gráfico de Indicadores</h3>
                <IndicatorChart height={200} />
              </div>
            </div>

            {/* Últimos datos */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Recientes</h3>
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
                    {indicators.slice(0, 5).map((indicator) => (
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
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && <InteractiveMap />}
        
        {activeTab === 'charts' && (
          <div className="space-y-8">
            <IndicatorChart />
          </div>
        )}
      </main>
    </div>
  );
}