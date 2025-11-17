// src/hooks/useReports.ts - COMPLETO
import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import type { Report } from '../types/report.types';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAll();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: any) => {
    try {
      const newReport = await reportService.create(reportData);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError('Error al crear el reporte');
      throw err;
    }
  };

  const deleteReport = async (id: number) => {
    try {
      await reportService.delete(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError('Error al eliminar el reporte');
      throw err;
    }
  };

  return {
    reports,
    loading,
    error,
    createReport,
    deleteReport,
    refetch: loadReports
  };
};