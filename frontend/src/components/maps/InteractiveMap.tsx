// src/components/maps/InteractiveMap.tsx - COMPLETO CON FUNCIONALIDAD
import { useState, useEffect } from 'react';
import { indicatorService } from '../../services/indicatorService';
import { regionService } from '../../services/regionService';
import type { MapIndicator, AvailableIndicator } from '../../types/indicator.types';
import type { Region } from '../../types/region.types';
import Loading from '../common/Loading';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function InteractiveMap() {
  const [mapData, setMapData] = useState<MapIndicator[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<AvailableIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedIndicator, setSelectedIndicator] = useState('cobertura_bruta');
  const [selectedRegion, setSelectedRegion] = useState<MapIndicator | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (availableIndicators.length > 0) {
      loadMapData();
    }
  }, [selectedYear, selectedIndicator]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [regionsData, indicatorsData] = await Promise.all([
        regionService.getAll(),
        indicatorService.getAvailableIndicators()
      ]);
      
      setRegions(regionsData);
      setAvailableIndicators(indicatorsData);
      
      // Cargar datos iniciales del mapa
      await loadMapData();
    } catch (err) {
      setError('Error al cargar datos iniciales');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMapData = async () => {
    try {
      const data = await indicatorService.getMapData(selectedYear, selectedIndicator);
      setMapData(data);
    } catch (err) {
      setError('Error al cargar datos del mapa');
    }
  };

  const handleRegionClick = (region: MapIndicator) => {
    setSelectedRegion(region);
  };

  const getColorForValue = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Mapa Interactivo de Colombia</h2>
        
        {/* Controles del mapa */}
        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <Select
              label="Año"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={[
                { value: 2024, label: '2024' },
                { value: 2023, label: '2023' },
                { value: 2022, label: '2022' },
                { value: 2021, label: '2021' }
              ]}
            />
          </div>
          
          <div className="w-64">
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

          <div className="flex items-end">
            <Button onClick={loadMapData} variant="primary">
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Mapa y panel de información */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa interactivo */}
        <div className="lg:col-span-2">
          <div className="border-2 border-gray-200 rounded-lg h-96 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
            {/* Simulación de mapa con regiones clickeables */}
            <div className="absolute inset-4">
              {mapData.map((region, index) => (
                <div
                  key={region.code}
                  className={`absolute cursor-pointer transition-all transform hover:scale-110 hover:z-10 ${getColorForValue(region.value)} rounded-lg border-2 border-white shadow-md flex items-center justify-center text-white font-semibold text-xs`}
                  style={{
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 15}%`,
                    width: '18%',
                    height: '12%',
                    backgroundColor: region === selectedRegion ? '#3B82F6' : undefined
                  }}
                  onClick={() => handleRegionClick(region)}
                  title={`${region.region}: ${region.value} ${region.unit}`}
                >
                  <span className="truncate px-1">{region.region}</span>
                </div>
              ))}
            </div>
            
            {/* Leyenda del mapa */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <h4 className="font-semibold text-sm mb-2">Leyenda</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-2 rounded"></div>
                  <span>Alto (≥80%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 mr-2 rounded"></div>
                  <span>Medio-Alto (60-79%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 mr-2 rounded"></div>
                  <span>Medio (40-59%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 mr-2 rounded"></div>
                  <span>Bajo (20-39%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 mr-2 rounded"></div>
                  <span>Muy Bajo (&lt;20%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de información de región seleccionada */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            {selectedRegion ? selectedRegion.region : 'Selecciona una región'}
          </h3>
          
          {selectedRegion ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedRegion.value} {selectedRegion.unit}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedRegion.indicator}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Código</div>
                  <div className="font-semibold">{selectedRegion.code}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Año</div>
                  <div className="font-semibold">{selectedRegion.year}</div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded text-sm">
                <div className="text-gray-500 mb-1">Coordenadas</div>
                <div className="font-mono text-xs">
                  Lat: {selectedRegion.coordinates.lat}, Lng: {selectedRegion.coordinates.lng}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => window.open(`/comparison?region=${selectedRegion.metadata.regionId}`, '_blank')}
              >
                Comparar esta región
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🗺️</div>
              <p>Haz clic en cualquier región del mapa para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de datos */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mapData.length}</div>
          <div className="text-sm text-blue-800">Regiones cargadas</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {mapData.length > 0 ? Math.max(...mapData.map(d => d.value)).toFixed(1) : 0}
          </div>
          <div className="text-sm text-green-800">Valor máximo</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {mapData.length > 0 ? Math.min(...mapData.map(d => d.value)).toFixed(1) : 0}
          </div>
          <div className="text-sm text-yellow-800">Valor mínimo</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {mapData.length > 0 ? (mapData.reduce((sum, d) => sum + d.value, 0) / mapData.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-purple-800">Promedio</div>
        </div>
      </div>
    </div>
  );
}