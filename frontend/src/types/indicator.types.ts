// src/types/indicator.types.ts - COMPLETO
import type { Region } from './region.types';

export interface Indicator {
  id: number;
  region_id: number;
  dataset_id: number;
  year: number;
  indicator_code: string;
  indicator_name: string;
  value: number;
  unit: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  Region?: Region;
}

export interface MapIndicator {
  region: string;
  code: string;
  value: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  indicator: string;
  year: number;
  unit: string;
  metadata: {
    regionId: number;
    indicatorCode: string;
  };
}

export interface ComparisonRequest {
  regionIds: number[];
  indicator: string;
  year?: number;
}

export interface ComparisonResult {
  comparison: Array<{
    region: string;
    value: number;
    unit: string;
    indicator: string;
  }>;
  gaps: Array<{
    region1: string;
    region2: string;
    gap: number;
    percentageGap: string;
  }>;
  alerts: Array<{
    region1: string;
    region2: string;
    gapPercentage: string;
    severity: 'CRITICA' | 'ALTA';
    message: string;
  }>;
  metadata: {
    indicator: string;
    year: number;
    totalRegions: number;
  };
}

export interface FilterRequest {
  regions?: number[];
  indicators?: string[];
  years?: number[];
  minValue?: number;
  maxValue?: number;
}

export interface TrendData {
  region: string;
  indicator: string;
  unit: string;
  trends: Array<{
    year: number;
    value: number;
  }>;
  period: string;
}

export interface AvailableIndicator {
  indicator_code: string;
  indicator_name: string;
  unit: string;
  min_year: number;
  max_year: number;
}