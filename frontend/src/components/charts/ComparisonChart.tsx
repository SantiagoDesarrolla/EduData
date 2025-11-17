// src/components/charts/ComparisonChart.tsx - COMPLETO CON COMPARACIÓN
import { useState, useEffect } from 'react';
import { indicatorService } from '../../services/indicatorService';
import { regionService } from '../../services/regionService';
import type { ComparisonResult, AvailableIndicator } from '../../types/indicator.types';
import type { Region } from '../../types/region.types';
import Loading from '../common/Loading';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function ComparisonChart() {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<AvailableIndicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('cobertura_bruta');
  const [selectedYear, setSelectedYear] = useState(2024);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [regionsData, indicatorsData] = await Promise.all([
        regionService.getAll(),
        indicatorService.getAvailableIndicators()
      ]);
      
      setRegions(regionsData.filter(region => region.type === 'departamento'));
      setAvailableIndicators(indicatorsData);
      
      // Seleccionar primeras 3 regiones por defecto
      if (regionsData.length >= 3) {
        setSelectedRegions(regionsData.slice(0, 3).map(region => region.id));
      }
    } catch (err) {
      setError('Error al cargar datos iniciales');
    }
  };

  const handleCompare = async () => {
    if (selectedRegions.length < 2) {
      setError('Selecciona al menos 2 regiones para comparar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await indicatorService.compareRegions({
        regionIds: selectedRegions,
        indicator: selectedIndicator,
        year: selectedYear
      });
      
      setComparisonResult(result);
    } catch (err) {
      setError('Error al realizar la comparación');
    } finally {
      setLoading(false);
    }
  };

  const toggleRegion = (regionId: number) => {
    setSelectedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const renderComparisonChart = () => {
    if (!comparisonResult) return null;

    const maxValue = Math.max(...comparisonResult.comparison.map(item => item.value));

    return (
      <div className="space-y-4">
        {/* Gráfico de comparación */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-4 text-center">
            Comparación: {comparisonResult.metadata.indicator}
          </h4>
          
          <div className="space-y-3">
            {comparisonResult.comparison.map((item, index) => (
              <div key={item.region} className="flex items-center space-x-4">
                <div className="w-48 text-sm font-medium text-gray-700">
                  {item.region}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <div
                      className="h-8 rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: getColorForIndex(index)
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="text-sm font-semibold text-white">
                        {item.value} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brechas detectadas */}
        {comparisonResult.gaps.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Análisis de Brechas</h4>
            <div className="space-y-2">
              {comparisonResult.gaps.map((gap, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{gap.region1} vs {gap.region2}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{gap.gap.toFixed(2)} {comparisonResult.comparison[0]?.unit}</span>
                    <span className="text-gray-500">({gap.percentageGap}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas de brechas significativas */}
        {comparisonResult.alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Alertas de Brechas Significativas</h4>
            <div className="space-y-2">
              {comparisonResult.alerts.map((alert, index) => (
                <div key={index} className="text-sm text-red-700">
                  <div className="font-semibold">{alert.severity}: {alert.region1} - {alert.region2}</div>
                  <div>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getColorForIndex = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Comparación de Regiones</h2>
        
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

          <div className="flex items-end">
            <Button 
              onClick={handleCompare} 
              variant="primary"
              loading={loading}
              disabled={selectedRegions.length < 2}
            >
              Comparar
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de regiones */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Selecciona regiones para comparar (mínimo 2):</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {regions.map(region => (
            <div
              key={region.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedRegions.includes(region.id)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => toggleRegion(region.id)}
            >
              <div className="text-sm font-medium text-center">
                {region.name}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {selectedRegions.length} regiones seleccionadas
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* Resultados de la comparación */}
      {loading ? (
        <Loading />
      ) : comparisonResult ? (
        renderComparisonChart()
      ) : (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">⚖️</div>
          <p className="text-lg">Selecciona regiones y haz clic en "Comparar" para ver el análisis</p>
          <p className="text-sm mt-2">Se mostrarán brechas y alertas automáticamente</p>
        </div>
      )}

      {/* Información adicional */}
      {comparisonResult && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-700">Resumen</div>
            <div className="mt-1">
              <div>Regiones comparadas: {comparisonResult.metadata.totalRegions}</div>
              <div>Indicador: {comparisonResult.metadata.indicator}</div>
              <div>Año: {comparisonResult.metadata.year}</div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-700">Brechas Detectadas</div>
            <div className="mt-1">
              <div>Total brechas: {comparisonResult.gaps.length}</div>
              <div>Alertas: {comparisonResult.alerts.length}</div>
              <div>Mayor brecha: {comparisonResult.gaps.length > 0 ? 
                Math.max(...comparisonResult.gaps.map(gap => parseFloat(gap.percentageGap))).toFixed(1) + '%' : 'N/A'
              }</div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-semibold text-purple-700">Recomendaciones</div>
            <div className="mt-1">
              {comparisonResult.alerts.length > 0 ? (
                <div>Revisar las regiones con brechas críticas</div>
              ) : comparisonResult.gaps.length > 0 ? (
                <div>Brechas dentro de rangos aceptables</div>
              ) : (
                <div>No se detectaron brechas significativas</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}