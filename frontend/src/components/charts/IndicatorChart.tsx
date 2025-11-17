// src/components/charts/IndicatorChart.tsx - COMPLETO CON GRÁFICOS
import { useState, useEffect } from 'react';
import { indicatorService } from '../../services/indicatorService';
import type { Indicator, AvailableIndicator } from '../../types/indicator.types';
import Loading from '../common/Loading';
import Select from '../ui/Select';

interface IndicatorChartProps {
  regionId?: number;
  initialIndicator?: string;
  height?: number;
}

export default function IndicatorChart({ 
  regionId, 
  initialIndicator = 'cobertura_bruta',
  height = 400 
}: IndicatorChartProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<AvailableIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIndicator, setSelectedIndicator] = useState(initialIndicator);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  useEffect(() => {
    loadAvailableIndicators();
  }, []);

  useEffect(() => {
    if (availableIndicators.length > 0) {
      loadIndicatorData();
    }
  }, [selectedIndicator, selectedYear, regionId]);

  const loadAvailableIndicators = async () => {
    try {
      const data = await indicatorService.getAvailableIndicators();
      setAvailableIndicators(data);
    } catch (err) {
      setError('Error al cargar indicadores disponibles');
    }
  };

  const loadIndicatorData = async () => {
    try {
      setLoading(true);
      let data;
      
      if (regionId) {
        // Datos específicos de una región
        data = await indicatorService.getByRegion(regionId, {
          indicator: selectedIndicator,
          year: selectedYear
        });
      } else {
        // Todos los datos con filtros
        data = await indicatorService.getAll(1, 50, {
          indicator: selectedIndicator,
          year: selectedYear
        });
        data = data?.data || data;
      }
      
      // Asegurar que data es un array y normalizar tipos (value como Number)
      const arr = Array.isArray(data) ? data : [];
      const normalized = arr.map(item => ({
        // mantener la forma original pero forzar value numérico
        ...item,
        value: typeof item.value === 'string' ? Number(item.value) : (item.value ?? 0)
      }));
      setIndicators(normalized);
    } catch (err) {
      setError('Error al cargar datos del indicador');
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) return <Loading />;
    if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
    if (!indicators || indicators.length === 0) return <div className="text-gray-500 text-center py-8">No hay datos disponibles</div>;

    // Simulación de gráficos con CSS (en un proyecto real usarías Chart.js, D3, etc.)
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  const renderBarChart = () => {
    if (!indicators || indicators.length === 0) return null;
    const maxValue = Math.max(...indicators.map(ind => Number(ind.value || 0)));
    if (!isFinite(maxValue) || maxValue === 0) return <div className="text-center py-8 text-gray-500">Todos los valores son 0</div>;
    
    return (
      <div className="space-y-2" style={{ height: `${height}px` }}>
        {indicators.slice(0, 10).map((indicator) => (
          <div key={indicator.id} className="flex items-center space-x-3">
            <div className="w-32 text-sm text-gray-600 truncate">
              {indicator.Region?.name || `Región ${indicator.region_id}`}
            </div>
            <div className="flex-1">
              <div
                className="bg-blue-500 h-6 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(indicator.value / maxValue) * 100}%`,
                  backgroundColor: getColorForValue(indicator.value)
                }}
              ></div>
            </div>
            <div className="w-16 text-sm font-semibold text-gray-700">
              {indicator.value} {indicator.unit}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    // Agrupar por región para tendencias (simplificado)
    return (
      <div 
        className="relative bg-gradient-to-b from-blue-50 to-transparent rounded-lg p-4"
        style={{ height: `${height}px` }}
      >
        <div className="flex items-end justify-between h-full">
          {indicators.slice(0, 8).map((indicator, index) => (
            <div key={indicator.id} className="flex flex-col items-center">
              <div
                className="w-8 bg-green-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${(indicator.value / 100) * (height - 80)}px` }}
              ></div>
              <div className="text-xs mt-2 text-gray-600 w-16 text-center truncate">
                {indicator.Region?.name || `R${index + 1}`}
              </div>
              <div className="text-xs font-semibold mt-1">
                {indicator.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    if (!indicators || indicators.length === 0) return null;
    const total = indicators.reduce((sum, ind) => sum + Number(ind.value || 0), 0);
    if (!isFinite(total) || total === 0) return <div className="text-center py-8 text-gray-500">Total es 0</div>;
    
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="relative w-64 h-64">
          {/* Simulación de gráfico de torta */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
          {indicators.slice(0, 5).map((indicator, index) => {
            return (
              <div
                key={indicator.id}
                className="absolute inset-0 rounded-full border-8 border-transparent"
                style={{
                  borderTopColor: getColorForIndex(index),
                  transform: `rotate(${index * 72}deg)`,
                  borderTopWidth: '8px',
                  borderRightWidth: '8px'
                }}
              ></div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{Number(total).toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getColorForValue = (value: number) => {
    if (value >= 80) return '#10B981'; // green-500
    if (value >= 60) return '#34D399'; // green-400
    if (value >= 40) return '#FBBF24'; // yellow-400
    if (value >= 20) return '#FB923C'; // orange-400
    return '#EF4444'; // red-500
  };

  const getColorForIndex = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {regionId ? 'Indicadores de la Región' : 'Análisis de Indicadores'}
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <Select
              label="Indicador"
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              options={availableIndicators.map(ind => ({
                value: ind.indicator_code,
                label: ind.indicator_name
              }))}
            />
          </div>
          
          <div className="w-32">
            <Select
              label="Año"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={[
                { value: 2024, label: '2024' },
                { value: 2023, label: '2023' },
                { value: 2022, label: '2022' }
              ]}
            />
          </div>

          <div className="w-32">
            <Select
              label="Tipo"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              options={[
                { value: 'bar', label: 'Barras' },
                { value: 'line', label: 'Líneas' },
                { value: 'pie', label: 'Torta' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        {renderChart()}
      </div>

      {/* Leyenda y estadísticas */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-semibold text-gray-700">Resumen</div>
          <div className="mt-1 space-y-1">
            <div>Regiones: {indicators.length}</div>
            <div>Indicador: {availableIndicators.find(ind => ind.indicator_code === selectedIndicator)?.indicator_name}</div>
            <div>Año: {selectedYear}</div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-semibold text-blue-700">Estadísticas</div>
          <div className="mt-1 space-y-1">
            <div>Promedio: {indicators.length > 0 ? (indicators.reduce((sum, ind) => sum + ind.value, 0) / indicators.length).toFixed(1) : 0}</div>
            <div>Máximo: {indicators.length > 0 ? Math.max(...indicators.map(ind => ind.value)).toFixed(1) : 0}</div>
            <div>Mínimo: {indicators.length > 0 ? Math.min(...indicators.map(ind => ind.value)).toFixed(1) : 0}</div>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-semibold text-green-700">Leyenda</div>
          <div className="mt-1 space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-2 rounded"></div>
              <span>Alto (80-100%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 mr-2 rounded"></div>
              <span>Medio (40-79%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 mr-2 rounded"></div>
              <span>Bajo (0-39%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}