// src/components/charts/TrendChart.tsx - COMPLETO CON TENDENCIAS
import { useState, useEffect } from 'react';
import { indicatorService } from '../../services/indicatorService';
import { regionService } from '../../services/regionService';
import type { TrendData, AvailableIndicator } from '../../types/indicator.types';
import type { Region } from '../../types/region.types';
import Loading from '../common/Loading';
import Select from '../ui/Select';

export default function TrendChart() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<AvailableIndicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRegion, setSelectedRegion] = useState<number | ''>('');
  const [selectedIndicator, setSelectedIndicator] = useState('cobertura_bruta');
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2024);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRegion && availableIndicators.length > 0) {
      loadTrendData();
    }
  }, [selectedRegion, selectedIndicator, startYear, endYear]);

  const loadInitialData = async () => {
    try {
      const [regionsData, indicatorsData] = await Promise.all([
        regionService.getAll(),
        indicatorService.getAvailableIndicators()
      ]);
      
      setRegions(regionsData.filter(region => region.type === 'departamento'));
      setAvailableIndicators(indicatorsData);
      
      // Seleccionar primera región por defecto
      if (regionsData.length > 0) {
        setSelectedRegion(regionsData[0].id);
      }
    } catch (err) {
      setError('Error al cargar datos iniciales');
    }
  };

  const loadTrendData = async () => {
    if (!selectedRegion) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await indicatorService.getTrends(
        selectedRegion,
        selectedIndicator,
        startYear,
        endYear
      );
      
      setTrendData(data);
    } catch (err) {
      setError('Error al cargar datos de tendencias');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendChart = () => {
    if (!trendData || !trendData.trends.length) {
      return <div className="text-gray-500 text-center py-12">No hay datos de tendencias disponibles</div>;
    }

    const values = trendData.trends.map(t => t.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const years = trendData.trends.map(t => t.year);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-lg mb-4 text-center">
          Tendencias: {trendData.region} - {trendData.indicator}
        </h4>
        
        {/* Gráfico de líneas */}
        <div className="relative h-64">
          {/* Eje Y */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue.toFixed(0)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
            <span>{minValue.toFixed(0)}</span>
          </div>
          
          {/* Área del gráfico */}
          <div className="ml-12 h-full relative">
            {/* Línea de tendencia */}
            <svg className="w-full h-full" viewBox={`0 0 ${years.length * 100} 100`} preserveAspectRatio="none">
              {/* Línea de tendencia */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                points={trendData.trends.map((trend, index) => 
                  `${(index / (years.length - 1)) * 100},${100 - ((trend.value - minValue) / (maxValue - minValue)) * 100}`
                ).join(' ')}
              />
              
              {/* Área bajo la curva */}
              <polygon
                fill="rgba(59, 130, 246, 0.1)"
                points={`
                  0,100 
                  ${trendData.trends.map((trend, index) => 
                    `${(index / (years.length - 1)) * 100},${100 - ((trend.value - minValue) / (maxValue - minValue)) * 100}`
                  ).join(' ')}
                  ${(years.length - 1) * 100},100
                `}
              />
              
              {/* Puntos de datos */}
              {trendData.trends.map((trend, index) => (
                <circle
                  key={trend.year}
                  cx={(index / (years.length - 1)) * 100}
                  cy={100 - ((trend.value - minValue) / (maxValue - minValue)) * 100}
                  r="4"
                  fill="#3B82F6"
                />
              ))}
            </svg>
            
            {/* Eje X - Años */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              {years.map(year => (
                <span key={year}>{year}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Datos numéricos */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {trendData.trends.map(trend => (
            <div key={trend.year} className="bg-blue-50 p-2 rounded text-center">
              <div className="font-semibold text-blue-700">{trend.year}</div>
              <div className="text-sm">{trend.value} {trendData.unit}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateTrendAnalysis = () => {
    if (!trendData || trendData.trends.length < 2) return null;

    const values = trendData.trends.map(t => t.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentageChange = (change / firstValue) * 100;
    
    return {
      change,
      percentageChange,
      direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
      trend: Math.abs(percentageChange) > 5 ? (percentageChange > 0 ? 'Mejorando' : 'Empeorando') : 'Estable'
    };
  };

  const trendAnalysis = calculateTrendAnalysis();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Análisis de Tendencias</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <Select
              label="Región"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value ? Number(e.target.value) : '')}
              options={regions.map(region => ({
                value: region.id,
                label: region.name
              }))}
            />
          </div>
          
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
              label="Desde"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              options={[
                { value: 2020, label: '2020' },
                { value: 2021, label: '2021' },
                { value: 2022, label: '2022' }
              ]}
            />
          </div>

          <div className="w-32">
            <Select
              label="Hasta"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              options={[
                { value: 2024, label: '2024' },
                { value: 2023, label: '2023' },
                { value: 2022, label: '2022' }
              ]}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Gráfico de tendencias */}
      {loading ? (
        <Loading />
      ) : (
        renderTrendChart()
      )}

      {/* Análisis de la tendencia */}
      {trendAnalysis && trendData && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${
            trendAnalysis.direction === 'increase' ? 'bg-green-50 border border-green-200' :
            trendAnalysis.direction === 'decrease' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-sm text-gray-600">Tendencia</div>
            <div className={`text-xl font-bold ${
              trendAnalysis.direction === 'increase' ? 'text-green-700' :
              trendAnalysis.direction === 'decrease' ? 'text-red-700' :
              'text-gray-700'
            }`}>
              {trendAnalysis.trend}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600">Cambio Total</div>
            <div className="text-xl font-bold text-blue-700">
              {trendAnalysis.change > 0 ? '+' : ''}{trendAnalysis.change.toFixed(1)} {trendData.unit}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-gray-600">Cambio %</div>
            <div className="text-xl font-bold text-purple-700">
              {trendAnalysis.percentageChange > 0 ? '+' : ''}{trendAnalysis.percentageChange.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm text-gray-600">Período</div>
            <div className="text-xl font-bold text-yellow-700">
              {startYear}-{endYear}
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {trendData && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Interpretación de la Tendencia</h4>
          <p className="text-sm text-gray-600">
            {trendAnalysis?.direction === 'increase' 
              ? `El indicador muestra una tendencia positiva de mejora en ${trendData.region} durante el período ${trendData.period}.`
              : trendAnalysis?.direction === 'decrease'
              ? `El indicador muestra una tendencia negativa en ${trendData.region} durante el período ${trendData.period}. Se recomienda análisis adicional.`
              : `El indicador se mantiene estable en ${trendData.region} durante el período ${trendData.period}.`
            }
          </p>
        </div>
      )}
    </div>
  );
}