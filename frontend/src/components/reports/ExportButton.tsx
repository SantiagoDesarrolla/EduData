import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '../ui/Button';

interface ExportButtonProps {
  data: any[];
  filename: string;
  format: 'csv' | 'json' | 'pdf' | 'excel';
  disabled?: boolean;
}

export default function ExportButton({ 
  data, 
  filename, 
  format, 
  disabled = false 
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const exportToJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    setExporting(true);

    try {
      let content = '';
      let mimeType = '';
      let fileExtension = '';

      if (format === 'csv') {
        content = exportToCSV(data);
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      } else if (format === 'json') {
        content = exportToJSON(data);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else {
        alert(`Formato ${format} no soportado aún`);
        return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.${fileExtension}`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={disabled || !data || data.length === 0}
      className="flex items-center gap-2 w-full"
    >
      <Download size={16} />
      Exportar {format.toUpperCase()} ({data?.length || 0})
    </Button>
  );
}
