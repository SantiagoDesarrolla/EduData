// src/components/reports/FilterPanel.tsx - COMPLETO CON FILTROS AVANZADOS
import { useState, useEffect } from 'react';
import { regionService } from '../../services/regionService';
import { indicatorService } from '../../services/indicatorService';
import type { Region } from '../../types/region.types';
import type { AvailableIndicator } from '../../types/indicator.types';
import Button from '../ui/Button';
import Select from '../ui/Select';

export interface FilterValues {
  regions: number[];
  indicators: string[];
  years: number[];
  minValue?: number;
  maxValue?: number;
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
}

export default function FilterPanel({ onFiltersChange, initialFilters }: FilterPanelProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<AvailableIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<FilterValues>({
    regions: initialFilters?.regions || [],
    indicators: initialFilters?.indicators || [],
    years: initialFilters?.years || [2024],
    minValue: initialFilters?.minValue,
    maxValue: initialFilters?.maxValue
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const loadInitialData = async () => {
    try {
      const [regionsData, indicatorsData] = await Promise.all([
        regionService.getAll(),
        indicatorService.getAvailableIndicators()
      ]);
      
      setRegions(regionsData.filter(region => region.type === 'departamento'));
      setAvailableIndicators(indicatorsData);
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterValues, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      regions: [],
      indicators: [],
      years: [2024],
      minValue: undefined,
      maxValue: undefined
    });
  };

  const availableYears = [2024, 2023, 2022, 2021, 2020];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filtros Avanzados</h3>
        <Button
          onClick={clearFilters}
          variant="outline"
          size="sm"
        >
          Limpiar Filtros
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filtro de Regiones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regiones
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
            {regions.map(region => (
              <label key={region.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={filters.regions.includes(region.id)}
                  onChange={(e) => {
                    const newRegions = e.target.checked
                      ? [...filters.regions, region.id]
                      : filters.regions.filter(id => id !== region.id);
                    updateFilter('regions', newRegions);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{region.name}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {filters.regions.length} regiones seleccionadas
          </div>
        </div>

        {/* Filtro de Indicadores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indicadores
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
            {availableIndicators.map(indicator => (
              <label key={indicator.indicator_code} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={filters.indicators.includes(indicator.indicator_code)}
                  onChange={(e) => {
                    const newIndicators = e.target.checked
                      ? [...filters.indicators, indicator.indicator_code]
                      : filters.indicators.filter(code => code !== indicator.indicator_code);
                    updateFilter('indicators', newIndicators);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{indicator.indicator_name}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {filters.indicators.length} indicadores seleccionados
          </div>
        </div>

        {/* Filtro de Años */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Años
          </label>
          <div className="flex flex-wrap gap-2">
            {availableYears.map(year => (
              <label key={year} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={filters.years.includes(year)}
                  onChange={(e) => {
                    const newYears = e.target.checked
                      ? [...filters.years, year]
                      : filters.years.filter(y => y !== year);
                    updateFilter('years', newYears);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{year}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por Rango de Valores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Mínimo
            </label>
            <input
              type="number"
              value={filters.minValue || ''}
              onChange={(e) => updateFilter('minValue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Máximo
            </label>
            <input
              type="number"
              value={filters.maxValue || ''}
              onChange={(e) => updateFilter('maxValue', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros Activos:</h4>
        <div className="flex flex-wrap gap-1">
          {filters.regions.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.regions.length} región(es)
            </span>
          )}
          {filters.indicators.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filters.indicators.length} indicador(es)
            </span>
          )}
          {filters.years.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {filters.years.length} año(s)
            </span>
          )}
          {(filters.minValue !== undefined || filters.maxValue !== undefined) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Rango: {filters.minValue || 0}-{filters.maxValue || '∞'}
            </span>
          )}
          {Object.values(filters).every(value => 
            Array.isArray(value) ? value.length === 0 : value === undefined
          ) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Sin filtros activos
            </span>
          )}
        </div>
      </div>
    </div>
  );
}