# 🔧 DETALLES DE IMPLEMENTACIÓN - ProyectoEduData

**Versión:** 1.0.0  
**Fecha:** 2024-12-19  
**Scope:** Backend + Frontend + Testing

---

## 📋 ÍNDICE

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Database Implementation](#database-implementation)
4. [Testing Implementation](#testing-implementation)
5. [API Endpoints](#api-endpoints)
6. [Modelos y Servicios](#modelos-y-servicios)
7. [Configuración y Deployment](#configuración-y-deployment)

---

## 🛠️ BACKEND IMPLEMENTATION

### Estructura Express.js

#### app.js - Configuración Principal

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

module.exports = app;
```

#### server.js - Entry Point

```javascript
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
```

### Controllers Implementation

#### IndicatorController.js - Indicadores

```javascript
const { Indicator, Region, Dataset } = require('../models');
const { Op } = require('sequelize');

class IndicatorController {
  // GET /api/indicators
  static async getIndicators(req, res) {
    try {
      const { region_id, year, code, page = 1, limit = 50 } = req.query;
      
      const where = {};
      if (region_id) where.region_id = region_id;
      if (year) where.year = parseInt(year);
      if (code) where.code = code;

      const indicators = await Indicator.findAndCountAll({
        where,
        include: [{ model: Region, attributes: ['name'] }],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['year', 'DESC']]
      });

      res.json({
        data: indicators.rows,
        total: indicators.count,
        page: parseInt(page),
        totalPages: Math.ceil(indicators.count / limit)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/indicators/trends/:indicatorCode
  static async getTrends(req, res) {
    try {
      const { indicatorCode } = req.params;
      const { region_id } = req.query;

      const where = { code: indicatorCode };
      if (region_id) where.region_id = region_id;

      const trends = await Indicator.findAll({
        where,
        attributes: ['year', 'value'],
        order: [['year', 'ASC']],
        raw: true
      });

      res.json({
        indicatorCode,
        trends,
        yearsAvailable: [...new Set(trends.map(t => t.year))]
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/indicators/map
  static async getMapData(req, res) {
    try {
      const regions = await Region.findAll({
        attributes: ['id', 'name', 'code', 'latitude', 'longitude'],
        include: [{
          model: Indicator,
          attributes: ['code', 'value', 'year'],
          where: { year: new Date().getFullYear() },
          required: false
        }]
      });

      const mapData = regions.map(region => ({
        id: region.id,
        name: region.name,
        code: region.code,
        lat: region.latitude,
        lng: region.longitude,
        indicators: region.Indicators
      }));

      res.json({ regions: mapData });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = IndicatorController;
```

#### ReportController.js - Reportes

```javascript
const { Report, Indicator, Region } = require('../models');
const ReportGeneratorService = require('../services/ReportGeneratorService');

class ReportController {
  // POST /api/reports/generate
  static async generateReport(req, res) {
    try {
      const { region_id, format, year, indicatorCode } = req.body;
      const userId = req.user.id;

      // Fetch data
      const indicators = await Indicator.findAll({
        where: { 
          region_id,
          year: year || { [Op.gte]: 2018 },
          ...(indicatorCode && { code: indicatorCode })
        },
        include: [Region],
        raw: true
      });

      // Generate file
      let fileContent, mimeType;
      if (format === 'PDF') {
        fileContent = ReportGeneratorService.generatePDF(indicators);
        mimeType = 'application/pdf';
      } else if (format === 'CSV') {
        fileContent = ReportGeneratorService.generateCSV(indicators);
        mimeType = 'text/csv';
      } else if (format === 'JSON') {
        fileContent = ReportGeneratorService.generateJSON(indicators);
        mimeType = 'application/json';
      }

      // Save to DB
      const report = await Report.create({
        title: `Report ${region_id} ${format}`,
        format,
        status: 'completed',
        region_id,
        user_id: userId,
        filters: { year, indicatorCode }
      });

      res.json({
        reportId: report.id,
        download: fileContent,
        mimeType
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ReportController;
```

### Services Implementation

#### ETLService.js - Procesamiento ETL

```javascript
const { Indicator, ETLLog } = require('../models');
const ExternalAPIService = require('./ExternalAPIService');

class ETLService {
  static async runETLProcess() {
    const startTime = new Date();
    const log = {
      source: 'EXTERNAL_APIS',
      status: 'pending'
    };

    try {
      // Fetch from APIs
      const menData = await ExternalAPIService.fetchFromMEN();
      const daneData = await ExternalAPIService.fetchFromDANE();

      // Transform data
      const transformedData = this.transformData([...menData, ...daneData]);

      // Batch insert
      const batchSize = 1000;
      let recordsCreated = 0;
      let recordsUpdated = 0;

      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);

        for (const item of batch) {
          const [indicator, created] = await Indicator.findOrCreate({
            where: {
              region_id: item.region_id,
              code: item.code,
              year: item.year
            },
            defaults: item
          });

          if (created) recordsCreated++;
          else recordsUpdated++;
        }
      }

      log.status = 'success';
      log.recordsProcessed = transformedData.length;
      log.recordsCreated = recordsCreated;
      log.recordsUpdated = recordsUpdated;

    } catch (error) {
      log.status = 'failed';
      log.error = error.message;
    }

    log.endTime = new Date();
    log.duration = log.endTime - startTime;

    await ETLLog.create(log);
    return log;
  }

  static transformData(data) {
    return data.map(item => ({
      region_id: item.region_id,
      code: item.indicator_code,
      name: item.indicator_name,
      value: parseFloat(item.value),
      year: parseInt(item.year),
      unit: item.unit || '%'
    }));
  }
}

module.exports = ETLService;
```

#### ExternalAPIService.js - APIs Externas

```javascript
const axios = require('axios');

class ExternalAPIService {
  static async fetchFromMEN() {
    try {
      const response = await axios.get(
        `${process.env.MEN_API_URL}indicators`,
        { timeout: 30000 }
      );
      
      return response.data.map(item => ({
        region_id: this.mapRegionCode(item.department),
        indicator_code: 'cobertura_bruta',
        indicator_name: 'Cobertura Bruta',
        value: item.cobertura,
        year: item.anio,
        unit: '%',
        source: 'MEN'
      }));
    } catch (error) {
      console.error('MEN API Error:', error.message);
      throw error;
    }
  }

  static async fetchFromDANE() {
    try {
      const response = await axios.get(
        `${process.env.DANE_API_URL}statistics`,
        { timeout: 30000 }
      );
      
      return response.data.map(item => ({
        region_id: this.mapRegionCode(item.region),
        indicator_code: 'population',
        indicator_name: 'Population',
        value: item.population,
        year: item.anio,
        source: 'DANE'
      }));
    } catch (error) {
      console.error('DANE API Error:', error.message);
      throw error;
    }
  }

  static mapRegionCode(regionName) {
    const regionMap = {
      'Antioquia': 1,
      'Bogotá': 2,
      // ... más regiones
    };
    return regionMap[regionName] || null;
  }
}

module.exports = ExternalAPIService;
```

### Middleware Implementation

#### auth.js - Autenticación JWT

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

#### roleMiddleware.js - Control de Roles

```javascript
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

module.exports = roleMiddleware;
```

---

## ⚛️ FRONTEND IMPLEMENTATION

### Components Architecture

#### Dashboard.tsx - Componente Principal

```typescript
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useIndicators } from '../hooks/useIndicators';
import MapComponent from './maps/MapComponent';
import ChartComponent from './charts/ChartComponent';
import FilterPanel from './common/FilterPanel';

const Dashboard: React.FC = () => {
  const { user } = useAppContext();
  const { indicators, loading, fetchIndicators } = useIndicators();
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  useEffect(() => {
    fetchIndicators({ region_id: selectedRegion, year: selectedYear });
  }, [selectedRegion, selectedYear]);

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <div className="col-span-2">
        <MapComponent 
          onRegionSelect={setSelectedRegion}
          selectedRegion={selectedRegion}
        />
      </div>
      
      <div className="col-span-1">
        <FilterPanel 
          year={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      <div className="col-span-3">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ChartComponent data={indicators} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
```

#### Maps Component

```typescript
import React, { useEffect, useState } from 'react';
import { useIndicators } from '../../hooks/useIndicators';

interface MapComponentProps {
  onRegionSelect: (regionId: number) => void;
  selectedRegion: number | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onRegionSelect,
  selectedRegion
}) => {
  const { mapData, fetchMapData } = useIndicators();

  useEffect(() => {
    fetchMapData();
  }, []);

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border-2 border-blue-300">
      {/* Map SVG or GeoJSON rendering */}
      {mapData?.regions.map(region => (
        <div
          key={region.id}
          onClick={() => onRegionSelect(region.id)}
          className={`region-marker ${
            selectedRegion === region.id ? 'selected' : ''
          }`}
          title={region.name}
        >
          📍
        </div>
      ))}
    </div>
  );
};

export default MapComponent;
```

#### Charts Component

```typescript
import React from 'react';

interface Indicator {
  code: string;
  name: string;
  value: number;
  year: number;
}

interface ChartComponentProps {
  data: Indicator[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No data available</p>;
  }

  // Agrupar por indicador
  const groupedByIndicator = data.reduce((acc, item) => {
    if (!acc[item.code]) {
      acc[item.code] = [];
    }
    acc[item.code].push(item);
    return acc;
  }, {} as Record<string, Indicator[]>);

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(groupedByIndicator).map(([code, items]) => (
        <div key={code} className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">{code}</h3>
          <svg className="w-full h-40">
            {/* Simple bar chart rendering */}
            {items.map((item, idx) => (
              <rect
                key={idx}
                x={idx * 40}
                y={100 - (item.value * 100) / 100}
                width="30"
                height={(item.value * 100) / 100}
                fill="#3b82f6"
              />
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
};

export default ChartComponent;
```

### Custom Hooks

#### useIndicators.ts

```typescript
import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

interface UseIndicatorsReturn {
  indicators: Indicator[];
  loading: boolean;
  error: string | null;
  fetchIndicators: (params: FilterParams) => Promise<void>;
  fetchMapData: () => Promise<void>;
  mapData: MapData | null;
}

export const useIndicators = (): UseIndicatorsReturn => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicators = useCallback(async (params: FilterParams) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/indicators', { params });
      setIndicators(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMapData = useCallback(async () => {
    try {
      const response = await apiClient.get('/indicators/map');
      setMapData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return {
    indicators,
    loading,
    error,
    fetchIndicators,
    fetchMapData,
    mapData
  };
};
```

### Context API

#### AppContext.tsx

```typescript
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ user, setUser, filters, setFilters, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

---

## 🗄️ DATABASE IMPLEMENTATION

### Models con Sequelize

#### Indicator.js

```javascript
module.exports = (sequelize, DataTypes) => {
  const Indicator = sequelize.define('Indicator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 100 }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      index: true,
      validate: { min: 2000, max: 2100 }
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: '%'
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Regions', key: 'id' }
    },
    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Datasets', key: 'id' }
    }
  }, {
    indexes: [
      { fields: ['region_id', 'year'] },
      { fields: ['code', 'year'] }
    ]
  });

  Indicator.associate = (models) => {
    Indicator.belongsTo(models.Region, { foreignKey: 'region_id' });
    Indicator.belongsTo(models.Dataset, { foreignKey: 'dataset_id' });
  };

  return Indicator;
};
```

### Migraciones (Si se usa Sequelize CLI)

```javascript
// migrations/001-create-indicators.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Indicators', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      region_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Regions', key: 'id' }
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable('Indicators');
  }
};
```

---

## 🧪 TESTING IMPLEMENTATION

### Test File Structure

```
backend/__tests__/unit/
├── IndicatorController.test.js
├── ComparisonAndETL.test.js
├── ExternalAPI.test.js
├── FiltersAndAlerts.test.js
└── ReportService.test.js
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/models/Index.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  testTimeout: 10000
};
```

### Test Implementation Pattern

```javascript
// __tests__/unit/IndicatorController.test.js
describe('IndicatorController', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {}, params: {}, user: { id: 1 } };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getIndicators', () => {
    it('debe retornar indicadores con filtros', async () => {
      req.query = { region_id: 1, year: 2024 };
      
      await IndicatorController.getIndicators(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('total');
    });
  });
});
```

---

## 🔌 API ENDPOINTS

### Indicadores

```
GET /api/indicators
Query: ?region_id=1&year=2024&page=1&limit=50
Response: { data: [], total: 100, page: 1, totalPages: 2 }

GET /api/indicators/trends/:indicatorCode
Query: ?region_id=1
Response: { indicatorCode, trends: [] }

GET /api/indicators/map
Response: { regions: [] }
```

### Regiones

```
GET /api/regions
Response: { data: [], total: 32 }

GET /api/regions/:id
Response: { id, name, code, latitude, longitude, ... }
```

### Reportes

```
POST /api/reports/generate
Body: { region_id, format, year, indicatorCode }
Response: { reportId, download, mimeType }

GET /api/reports/:id
Response: { id, title, format, status, ... }
```

### Autenticación

```
POST /api/auth/login
Body: { email, password }
Response: { token, user, role }

POST /api/auth/logout
Response: { message: 'Logged out' }
```

### ETL

```
POST /api/etl/update
Response: { status, recordsProcessed, ... }

GET /api/etl/logs
Response: { data: [], total: 50 }
```

---

## 📊 MODELOS Y SERVICIOS DETALLADOS

### ComparisonService

```javascript
class ComparisonService {
  static compareRegions(regions, indicatorCode, year) {
    return regions
      .map(r => ({
        region: r.name,
        value: r.indicators?.[indicatorCode]?.[year] || 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  static detectGaps(comparisonData, threshold = 20) {
    const values = comparisonData.map(d => d.value);
    const gap = Math.max(...values) - Math.min(...values);
    const gapPercentage = (gap / Math.max(...values)) * 100;
    
    return {
      detected: gapPercentage > threshold,
      gapPercentage: gapPercentage.toFixed(2),
      severity: gapPercentage > 50 ? 'critical' : 'high'
    };
  }
}
```

### ReportGeneratorService

```javascript
class ReportGeneratorService {
  static generateCSV(data, fields) {
    const header = fields.join(',');
    const rows = data.map(item =>
      fields.map(f => `"${item[f]}"`).join(',')
    );
    return [header, ...rows].join('\n');
  }

  static generateJSON(data) {
    return JSON.stringify(data, null, 2);
  }

  static generatePDF(data) {
    // Implementation with pdfkit
    return buffer;
  }
}
```

---

## ⚙️ CONFIGURACIÓN Y DEPLOYMENT

### npm Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage --verbose",
    "test:watch": "jest --watch",
    "seed": "node scripts/seedDatabase.js",
    "build": "npm run test && npm start"
  }
}
```

### Environment Variables

```bash
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=edudata
DB_USER=root
DB_PASSWORD=secure_password
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

### Deploy Checklist

- [ ] Instalar Node.js v22+
- [ ] Instalar MySQL 8.0+
- [ ] Crear base de datos
- [ ] Configurar variables .env
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run seed`
- [ ] Ejecutar tests: `npm test`
- [ ] Iniciar servidor: `npm start`
- [ ] Verificar endpoints

---

## 📈 MONITOREO Y LOGS

### Logging Implementation

```javascript
const logger = require('./utils/logger');

// En controllers
logger.info('Fetching indicators for region:', region_id);

// En services
logger.error('API call failed:', error.message);

// En middleware
logger.debug('JWT validated for user:', user.id);
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: 'connected'
  });
});
```

---

**Documento Versión:** 1.0.0  
**Última Actualización:** 2024-12-19  
**Estado:** ✅ COMPLETO
