// src/hooks/useETL.ts
import { useState, useEffect } from 'react';
import { etlService } from '../services/etlService';
import type { ETLLog, ETLStatus, APIResponse } from '../services/etlService';

interface UseETLReturn {
  logs: ETLLog[];
  loading: boolean;
  error: string | null;
  status: ETLStatus;
  loadLogs: (params?: any) => Promise<APIResponse<ETLLog[]>>;
  runETL: (datasetId: number) => Promise<APIResponse<any>>;
  loadStatus: () => Promise<ETLStatus>;
  testConnection: () => Promise<APIResponse<any>>;
  getMENData: (params?: any) => Promise<APIResponse<any>>;
}

export const useETL = (): UseETLReturn => {
  const [logs, setLogs] = useState<ETLLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ETLStatus>({
    recentLogs: [],
    stats: null,
    lastUpdate: null,
    isRunning: false
  });

  // Cargar logs ETL
  const loadLogs = async (params: any = {}): Promise<APIResponse<ETLLog[]>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await etlService.getETLLogs(params);
      setLogs(response.data || []);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error cargando logs ETL';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar ETL
  const runETL = async (datasetId: number): Promise<APIResponse<any>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await etlService.runETL(datasetId);
      // Recargar logs después de ejecutar
      await loadLogs();
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error ejecutando ETL';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar estado del ETL
  const loadStatus = async (): Promise<ETLStatus> => {
    try {
      const etlStatus = await etlService.getETLStatus();
      setStatus(etlStatus);
      return etlStatus;
    } catch (err: any) {
      const errorMessage = err.message || 'Error cargando estado ETL';
      console.error('Error cargando estado ETL:', err);
      setError(errorMessage);
      return status;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadLogs();
    loadStatus();
  }, []);

  return {
    logs,
    loading,
    error,
    status,
    loadLogs,
    runETL,
    loadStatus,
    testConnection: etlService.testExternalConnection,
    getMENData: etlService.getMENData
  };
};

export default useETL;