// src/pages/Admin.tsx - COMPLETO CON GESTIÓN
import { useState, useEffect } from 'react';
import { datasetService } from '../services/datasetService';
import { reportService } from '../services/reportService';
import Button from '../components/ui/Button';

interface Dataset {
  id: number;
  name: string;
  source_url: string;
  last_update: string;
  is_active: boolean;
}

interface Report {
  id: number;
  title: string;
  report_type: string;
  format: string;
  generated_at: string;
}

export default function Admin() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'datasets' | 'reports' | 'system'>('datasets');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [datasetsData, reportsData] = await Promise.all([
        datasetService.getAll(),
        reportService.getAll()
      ]);
      
      setDatasets(datasetsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDataset = async (datasetId: number) => {
    // Lógica para actualizar dataset
    alert(`Actualizando dataset ${datasetId}`);
  };

  const handleDeleteReport = async (reportId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        await reportService.delete(reportId);
        setReports(prev => prev.filter(report => report.id !== reportId));
      } catch (error) {
        alert('Error al eliminar el reporte');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel Administrativo
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona datasets, supervisa reportes y monitorea el sistema.
          </p>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'datasets', label: 'Datasets', count: datasets.length },
                { id: 'reports', label: 'Reportes', count: reports.length },
                { id: 'system', label: 'Sistema', count: null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'datasets' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Gestión de Datasets
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Fuentes de datos y programación de actualizaciones
                </p>
              </div>
              <Button variant="primary">
                Agregar Dataset
              </Button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {datasets.map(dataset => (
                  <li key={dataset.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            dataset.is_active ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {dataset.name}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateDataset(dataset.id)}
                            className="mr-2"
                          >
                            Actualizar
                          </Button>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {dataset.source_url}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Última actualización: {new Date(dataset.last_update).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Reportes Generados
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Historial y gestión de reportes del sistema
              </p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {reports.map(report => (
                  <li key={report.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {report.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Button variant="outline" size="sm" className="mr-2">
                            Descargar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 capitalize">
                            Tipo: {report.report_type}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Formato: {report.format.toUpperCase()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Generado: {new Date(report.generated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Estado del Sistema
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Monitoreo y configuración del sistema EduData
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Estado de la Base de Datos
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Conectado
                    </span>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    APIs Externas
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      MEN: Activo
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                      DANE: Activo
                    </span>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Última Sincronización
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date().toLocaleString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Acciones del Sistema
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="space-y-2">
                      <Button variant="primary" size="sm">
                        Ejecutar Sincronización
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2">
                        Ver Logs del Sistema
                      </Button>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}