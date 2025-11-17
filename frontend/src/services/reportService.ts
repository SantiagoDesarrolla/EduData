// src/services/reportService.ts - COMPLETO
import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { Report, CreateReportRequest } from '../types/report.types';

export const reportService = {
  async getAll(): Promise<Report[] | any> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.BASE);
    // Retorna tanto arrays directos como objetos con propiedad 'data'
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async getById(id: number): Promise<Report> {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.BY_ID(id));
    return response.data;
  },

  async create(reportData: CreateReportRequest): Promise<Report> {
    const response = await apiClient.post(API_ENDPOINTS.REPORTS.BASE, reportData);
    return response.data;
  },

  async update(id: number, reportData: Partial<Report>): Promise<Report> {
    const response = await apiClient.put(API_ENDPOINTS.REPORTS.BY_ID(id), reportData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REPORTS.BY_ID(id));
  },

  async downloadReport(filePath: string): Promise<Blob> {
    const response = await apiClient.get(filePath, {
      responseType: 'blob'
    });
    return response.data;
  },
};