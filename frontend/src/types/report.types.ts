// src/types/report.types.ts - COMPLETO
export interface Report {
  id: number;
  user_id?: number;
  title: string;
  filters: any;
  report_type: 'comparison' | 'regional' | 'trend';
  file_path?: string;
  format?: 'pdf' | 'csv';
  generated_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReportRequest {
  title: string;
  filters: any;
  report_type: 'comparison' | 'regional' | 'trend';
  format: 'pdf' | 'csv';
}

export interface ReportFilter {
  regions?: number[];
  indicators?: string[];
  years?: number[];
  comparisonType?: 'side-by-side' | 'trend';
}