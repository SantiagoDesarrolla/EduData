// src/pages/Comparison.tsx - COMPLETO CON COMPARACIÓN
import ComparisonChart from '../components/charts/ComparisonChart';
import TrendChart from '../components/charts/TrendChart';

export default function Comparison() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparación de Regiones
          </h1>
          <p className="text-lg text-gray-600">
            Compara múltiples regiones, analiza brechas y detecta tendencias en los indicadores educativos.
          </p>
        </div>

        <div className="space-y-8">
          <ComparisonChart />
          <TrendChart />
        </div>
      </div>
    </div>
  );
}