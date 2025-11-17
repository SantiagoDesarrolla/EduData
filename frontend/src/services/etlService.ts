// src/services/etlService.ts - SERVICIO PARA ETL
import apiClient from '../apiClient';
import { ENDPOINTS } from './endpoints';

// Interfaces para TypeScript
export interface ETLLog {
  id: number;
  dataset_id: number;
  dataset_name?: string;
  status: 'processing' | 'success' | 'error' | 'completed_with_errors';
  records_processed?: number;
  records_failed?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ETLStats {
  total_runs: number;
  success_runs: number;
  failed_runs: number;
  total_records: number;
  last_execution: string;
  average_processing_time: number;
}

export interface ETLStatus {
  recentLogs: ETLLog[];
  stats: ETLStats | null;
  lastUpdate: string | null;
  isRunning: boolean;
}

export interface APIResponse<T> {
  data: T;
  total?: number;
  page?: number;
  totalPages?: number;
  success?: boolean;
  message?: string;
}

export const etlService = {
  /**
   * Obtener todos los logs ETL
   */
  async getETLLogs(params: any = {}): Promise<APIResponse<ETLLog[]>> {
    try {
      const response = await apiClient.get(ENDPOINTS.ETL.LOGS, { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs ETL:', error);
      throw error;
    }
  },

  /**
   * Obtener un log ETL por ID
   */
  async getETLLogById(logId: number): Promise<APIResponse<ETLLog>> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.ETL.LOGS}/${logId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo log ETL ${logId}:`, error);
      throw error;
    }
  },

  /**
   * Ejecutar proceso ETL para un dataset específico
   */
  async runETL(datasetId: number): Promise<APIResponse<any>> {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ETL.LOGS}`, {
        dataset_id: datasetId,
        action: 'run_etl'
      });
      return response.data;
    } catch (error) {
      console.error('Error ejecutando ETL:', error);
      throw error;
    }
  },

  /**
   * Ejecutar ETL para todos los datasets activos
   */
  async runAllETL(): Promise<APIResponse<any>> {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ETL.LOGS}/run-all`);
      return response.data;
    } catch (error) {
      console.error('Error ejecutando ETL completo:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas del ETL
   */
  async getETLStats(): Promise<APIResponse<ETLStats>> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.ETL.LOGS}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas ETL:', error);
      throw error;
    }
  },

  /**
   * Obtener últimos logs ETL (para dashboard)
   */
  async getRecentLogs(limit: number = 10): Promise<APIResponse<ETLLog[]>> {
    try {
      const response = await apiClient.get(ENDPOINTS.ETL.LOGS, {
        params: { 
          limit, 
          sort: 'created_at:desc' 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs recientes:', error);
      throw error;
    }
  },

  /**
   * Probar conexión con APIs externas
   */
  async testExternalConnection(): Promise<APIResponse<any>> {
    try {
      const response = await apiClient.get(ENDPOINTS.API.TEST_CONNECTION);
      return response.data;
    } catch (error) {
      console.error('Error probando conexión externa:', error);
      throw error;
    }
  },

  /**
   * Obtener datos de prueba del MEN
   */
  async getMENData(params: any = {}): Promise<APIResponse<any>> {
    try {
      const response = await apiClient.get(ENDPOINTS.API.MEN_DATA, { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo datos MEN:', error);
      throw error;
    }
  },

  /**
   * Obtener estado actual del ETL
   */
  async getETLStatus(): Promise<ETLStatus> {
    try {
      const logs = await this.getRecentLogs(5);
      const stats = await this.getETLStats().catch(() => null);
      
      return {
        recentLogs: logs.data || [],
        stats: stats?.data || null,
        lastUpdate: logs.data?.[0]?.completed_at || null,
        isRunning: logs.data?.[0]?.status === 'processing'
      };
    } catch (error) {
      console.error('Error obteniendo estado ETL:', error);
      return {
        recentLogs: [],
        stats: null,
        lastUpdate: null,
        isRunning: false
      };
    }
  },

  /**
   * Crear nuevo log ETL (para administración)
   */
  async createETLLog(logData: Partial<ETLLog>): Promise<APIResponse<ETLLog>> {
    try {
      const response = await apiClient.post(ENDPOINTS.ETL.LOGS, logData);
      return response.data;
    } catch (error) {
      console.error('Error creando log ETL:', error);
      throw error;
    }
  },

  /**
   * Actualizar log ETL
   */
  async updateETLLog(logId: number, updateData: Partial<ETLLog>): Promise<APIResponse<ETLLog>> {
    try {
      const response = await apiClient.put(`${ENDPOINTS.ETL.LOGS}/${logId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando log ETL ${logId}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar log ETL
   */
  async deleteETLLog(logId: number): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.ETL.LOGS}/${logId}`);
      return response.data;
    } catch (error) {
      console.error(`Error eliminando log ETL ${logId}:`, error);
      throw error;
    }
  }
};

export default etlService;