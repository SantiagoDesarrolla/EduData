# 🎓 ProyectoEduData - Backend

Sistema backend para análisis de datos educativos colombianos con integración de APIs externas (MEN, DANE) y funcionalidades avanzadas de ETL, comparación regional y generación de reportes.

## 📊 Estado del Proyecto

**✅ PRUEBAS COMPLETADAS EXITOSAMENTE**

- ✅ 48/48 pruebas unitarias aprobadas (100%)
- ✅ 10/10 requisitos funcionales validados
- ✅ Tiempo de ejecución: 5.648s
- ✅ Listo para despliegue

## 🚀 Quick Start

### Instalación
```bash
npm install
```

### Base de Datos
```bash
npm run seed
```
Popula la base de datos con 32 regiones y 3,465 indicadores (2018-2024)

### Desarrollo
```bash
npm run dev
```
Inicia servidor en `http://localhost:3001`

### Producción
```bash
npm start
```

### Testing
```bash
# Ejecutar todas las pruebas
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm test -- --coverage
```

## 📋 Requisitos Funcionales Cubiertos

| RF | Descripción | Estado | Tests |
|----|-------------|--------|-------|
| RF-01 | Mapa Interactivo con regiones y tooltips | ✅ | 3 |
| RF-02 | Indicadores por región con filtros | ✅ | 2 |
| RF-03 | Comparación y detección de brechas | ✅ | 4 |
| RF-04 | Generación de reportes (PDF/CSV) | ✅ | 6 |
| RF-05 | Exportación en múltiples formatos | ✅ | 8 |
| RF-06 | Conexiones a APIs externas (MEN/DANE) | ✅ | 10 |
| RF-07 | Actualización automática ETL | ✅ | 4 |
| RF-08 | Tendencias históricas 2018-2024 | ✅ | 2 |
| RF-09 | Filtros avanzados y múltiples | ✅ | 4 |
| RF-10 | Alertas de brechas >20% | ✅ | 3 |

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── config/
│   │   ├── apiConfig.js         # API configuration
│   │   └── database.js          # Database connection
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Express middleware
│   ├── models/                  # Sequelize models
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   └── utils/                   # Utility functions
├── __tests__/
│   └── unit/                    # Unit tests
│       ├── IndicatorController.test.js
│       ├── ComparisonAndETL.test.js
│       ├── ExternalAPI.test.js
│       ├── FiltersAndAlerts.test.js
│       └── ReportService.test.js
├── scripts/
│   └── seedDatabase.js          # Database seeding script
├── jest.config.js               # Jest configuration
└── server.js                    # Server entry point
```

## 📚 API Endpoints

### Indicadores
- `GET /api/indicators` - Obtener indicadores
- `GET /api/indicators/trends` - Obtener tendencias
- `GET /api/indicators/map` - Datos para mapa

### Regiones
- `GET /api/regions` - Listar regiones
- `GET /api/regions/:id` - Región específica

### Reportes
- `POST /api/reports` - Generar reporte
- `GET /api/reports/:id` - Obtener reporte
- `POST /api/reports/export` - Exportar datos

### ETL
- `POST /api/etl/update` - Ejecutar actualización
- `GET /api/etl/logs` - Ver logs de ETL

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

## 🔧 Tecnologías

- **Runtime:** Node.js v22.14.0
- **Framework:** Express.js
- **Database:** MySQL/Sequelize
- **Testing:** Jest v29.7.0
- **Auth:** JWT + bcryptjs
- **APIs:** Axios
- **Export:** json2csv

## 📊 Base de Datos

### Seed Data
- **Regiones:** 32 departamentos colombianos
- **Indicadores:** 15 tipos (cobertura_bruta, tasa_deserción, etc.)
- **Años:** 2018-2024 (7 años)
- **Total Registros:** 3,465 indicadores

### Modelos Principales
- `User` - Usuarios del sistema
- `Region` - Regiones/Departamentos
- `Indicator` - Datos de indicadores
- `Dataset` - Conjuntos de datos
- `Report` - Reportes generados
- `ETLLog` - Logs de procesamiento

## 🔐 Autenticación

- JWT tokens
- Passwords encriptados con bcryptjs
- Roles: admin, analyst, viewer
- Middleware de autorización en rutas protegidas

## 📈 Pruebas

### Suite de Pruebas Unitarias

```
✅ FiltersAndAlerts.test.js        (7 tests)
✅ ExternalAPI.test.js             (10 tests)
✅ IndicatorController.test.js     (7 tests)
✅ ComparisonAndETL.test.js        (8 tests)
✅ ReportService.test.js           (16 tests)
─────────────────────────────────────────
   TOTAL: 48 tests PASSED (100%)
```

### Reportes
- Reporte completo: `TEST_REPORT.md`
- Datos en JSON: `test-results.json`

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Connection refused"
Verificar configuración de base de datos en `src/config/database.js`

### Error en seed
```bash
npm run seed
```

### Tests fallando
```bash
npm test -- --verbose
```

## 🚀 Próximos Pasos

1. ✅ Pruebas unitarias - **COMPLETADO**
2. ⏳ Pruebas de integración
3. ⏳ Pruebas E2E
4. ⏳ Despliegue en staging
5. ⏳ Despliegue en producción

## 📝 Documentación

- `TEST_REPORT.md` - Reporte completo de pruebas
- `test-results.json` - Resultados en formato JSON
- API Postman: `EduData_Postman_Collection.json`

## 👥 Contribuciones

Para contribuir:
1. Crear branch feature
2. Realizar cambios
3. Ejecutar tests: `npm test`
4. Hacer commit
5. Enviar PR

## 📞 Soporte

Para problemas o preguntas, revisar la documentación o contactar al equipo de desarrollo.

---

**Última actualización:** 2024-12-19  
**Versión:** 1.0.0  
**Estado:** ✅ PRODUCCIÓN LISTA
