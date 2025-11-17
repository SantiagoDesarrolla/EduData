// src/types/region.types.ts - COMPLETO
export interface Region {
  id: number;
  code: string;
  name: string;
  type: 'departamento' | 'municipio';
  parent_id?: number | null;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RegionWithIndicators extends Region {
  indicators?: any[];
  _count?: {
    indicators: number;
  };
}