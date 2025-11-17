# 📡 API DOCUMENTATION - ProyectoEduData

**Versión:** 1.0.0  
**URL Base:** `http://localhost:3001/api` (desarrollo) | `https://api.proyectoedudata.com/api` (producción)  
**Autenticación:** JWT Bearer Token

---

## 📋 ÍNDICE DE ENDPOINTS

### Authentication
- [POST /auth/login](#post-authlogin)
- [POST /auth/logout](#post-authlogout)
- [POST /auth/register](#post-authregister)

### Indicators
- [GET /indicators](#get-indicators)
- [GET /indicators/:id](#get-indicatorsid)
- [GET /indicators/trends/:code](#get-indicatorstrendscode)
- [GET /indicators/map](#get-indicatorsmap)

### Regions
- [GET /regions](#get-regions)
- [GET /regions/:id](#get-regionsid)

### Reports
- [POST /reports/generate](#post-reportsgenerate)
- [GET /reports](#get-reports)
- [GET /reports/:id](#get-reportsid)
- [DELETE /reports/:id](#delete-reportsid)

### Datasets
- [GET /datasets](#get-datasets)
- [POST /datasets](#post-datasets)

### ETL
- [POST /etl/update](#post-etlupdate)
- [GET /etl/logs](#get-etllogs)
- [GET /etl/logs/:id](#get-etllogsid)

---

## 🔐 AUTHENTICATION

### POST /auth/login

**Descripción:** Autentica un usuario y retorna un JWT token.

**Petición:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validaciones:**
- Email debe ser válido y existir en la BD
- Contraseña debe coincidir (bcrypt verification)
- Ambos campos son requeridos

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "analyst"
  },
  "expiresIn": "7d"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials",
  "code": "AUTH_001"
}
```

**Response (404 Not Found):**
```json
{
  "message": "User not found",
  "code": "AUTH_002"
}
```

---

### POST /auth/register

**Descripción:** Registra un nuevo usuario.

**Petición:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securePassword123",
    "name": "Jane Doe"
  }'
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "role": "viewer"
}
```

**Roles Disponibles:**
- `admin` - Acceso total
- `analyst` - Acceso a datos y reportes
- `viewer` - Solo lectura

**Response (201 Created):**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "name": "Jane Doe",
  "role": "viewer",
  "createdAt": "2024-12-19T10:30:00Z"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Email already registered",
  "code": "AUTH_003"
}
```

---

### POST /auth/logout

**Descripción:** Invalida la sesión del usuario.

**Headers Requeridos:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Petición:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 📊 INDICATORS

### GET /indicators

**Descripción:** Retorna lista de indicadores con filtros opcionales.

**Query Parameters:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| region_id | integer | No | ID de la región |
| year | integer | No | Año (2018-2024) |
| code | string | No | Código del indicador |
| page | integer | No | Página (default: 1) |
| limit | integer | No | Registros por página (default: 50, max: 500) |

**Petición:**
```bash
curl -X GET "http://localhost:3001/api/indicators?region_id=1&year=2024&page=1&limit=50" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "cobertura_bruta",
      "name": "Cobertura Bruta Educación",
      "value": 87.5,
      "year": 2024,
      "unit": "%",
      "region_id": 1,
      "region": {
        "id": 1,
        "name": "Antioquia"
      },
      "createdAt": "2024-12-19T10:00:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "totalPages": 5
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid filters provided",
  "errors": [
    "year must be between 2018 and 2024"
  ]
}
```

---

### GET /indicators/:id

**Descripción:** Retorna un indicador específico.

**Petición:**
```bash
curl -X GET http://localhost:3001/api/indicators/1 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "code": "cobertura_bruta",
  "name": "Cobertura Bruta Educación",
  "value": 87.5,
  "year": 2024,
  "unit": "%",
  "region_id": 1,
  "dataset_id": 5,
  "region": {
    "id": 1,
    "name": "Antioquia",
    "code": "05"
  },
  "dataset": {
    "id": 5,
    "name": "MEN Official Data",
    "source": "MEN"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Indicator not found",
  "code": "IND_001"
}
```

---

### GET /indicators/trends/:code

**Descripción:** Retorna serie histórica de un indicador (2018-2024).

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| code | string | Código del indicador |

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| region_id | integer | ID de la región (opcional) |

**Petición:**
```bash
curl -X GET "http://localhost:3001/api/indicators/trends/cobertura_bruta?region_id=1" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "indicatorCode": "cobertura_bruta",
  "indicatorName": "Cobertura Bruta Educación",
  "trends": [
    { "year": 2018, "value": 75.2 },
    { "year": 2019, "value": 78.5 },
    { "year": 2020, "value": 81.3 },
    { "year": 2021, "value": 83.7 },
    { "year": 2022, "value": 85.1 },
    { "year": 2023, "value": 86.4 },
    { "year": 2024, "value": 87.5 }
  ],
  "yearsAvailable": [2018, 2019, 2020, 2021, 2022, 2023, 2024],
  "statisticalAnalysis": {
    "mean": 82.1,
    "stdDev": 4.5,
    "trend": "increasing",
    "trendPercentage": 12.3
  }
}
```

---

### GET /indicators/map

**Descripción:** Retorna datos de indicadores para visualización en mapa.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| year | integer | Año (default: current) |
| indicator | string | Código del indicador (opcional) |

**Petición:**
```bash
curl -X GET "http://localhost:3001/api/indicators/map?year=2024" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "regions": [
    {
      "id": 1,
      "name": "Antioquia",
      "code": "05",
      "lat": 7.1291,
      "lng": -75.7453,
      "indicators": [
        {
          "code": "cobertura_bruta",
          "name": "Cobertura Bruta",
          "value": 87.5,
          "year": 2024,
          "unit": "%"
        }
      ],
      "tooltip": "Antioquia - Cobertura: 87.5%"
    }
  ],
  "metadata": {
    "year": 2024,
    "totalRegions": 32,
    "indicatorsIncluded": 5
  }
}
```

---

## 🗺️ REGIONS

### GET /regions

**Descripción:** Retorna lista de todas las regiones (32 departamentos colombianos).

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | integer | Página (default: 1) |
| limit | integer | Registros por página (default: 32) |

**Petición:**
```bash
curl -X GET http://localhost:3001/api/regions \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Antioquia",
      "code": "05",
      "latitude": 7.1291,
      "longitude": -75.7453,
      "region_type": "Department",
      "population": 6608000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 32,
  "page": 1,
  "totalPages": 1
}
```

---

### GET /regions/:id

**Descripción:** Retorna una región específica con sus indicadores.

**Petición:**
```bash
curl -X GET http://localhost:3001/api/regions/1 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Antioquia",
  "code": "05",
  "latitude": 7.1291,
  "longitude": -75.7453,
  "indicators": [
    {
      "code": "cobertura_bruta",
      "name": "Cobertura Bruta",
      "value": 87.5,
      "year": 2024
    }
  ],
  "statistics": {
    "totalIndicators": 3465,
    "yearsAvailable": [2018, 2019, 2020, 2021, 2022, 2023, 2024]
  }
}
```

---

## 📄 REPORTS

### POST /reports/generate

**Descripción:** Genera un reporte en formato solicitado (PDF, CSV, JSON).

**Headers Requeridos:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "region_id": 1,
  "format": "PDF",
  "year": 2024,
  "indicatorCode": "cobertura_bruta",
  "includeComparison": true,
  "includeTrends": true
}
```

**Parámetros:**
| Parámetro | Tipo | Obligatorio | Valores |
|-----------|------|-------------|---------|
| region_id | integer | Sí | 1-32 |
| format | string | Sí | PDF, CSV, JSON |
| year | integer | No | 2018-2024 |
| indicatorCode | string | No | Código indicador |
| includeComparison | boolean | No | default: false |
| includeTrends | boolean | No | default: false |

**Petición:**
```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": 1,
    "format": "PDF",
    "year": 2024,
    "includeTrends": true
  }'
```

**Response (200 OK) - PDF:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=report_antioquia_2024.pdf

[Binary PDF content]
```

**Response (200 OK) - CSV:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=report_antioquia_2024.csv

region,indicator_code,indicator_name,year,value,unit
Antioquia,cobertura_bruta,Cobertura Bruta,2024,87.5,%
...
```

**Response (200 OK) - JSON:**
```json
{
  "reportId": "rep_001",
  "region": { "id": 1, "name": "Antioquia" },
  "generatedAt": "2024-12-19T14:30:00Z",
  "format": "JSON",
  "data": [
    {
      "year": 2024,
      "indicators": [
        {
          "code": "cobertura_bruta",
          "value": 87.5
        }
      ]
    }
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid report parameters",
  "errors": [
    "format must be one of: PDF, CSV, JSON",
    "region_id is required"
  ]
}
```

---

### GET /reports

**Descripción:** Retorna lista de reportes generados por el usuario.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| format | string | Filtrar por formato |
| status | string | completed, processing, failed |
| page | integer | Página (default: 1) |

**Petición:**
```bash
curl -X GET "http://localhost:3001/api/reports?status=completed&page=1" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "rep_001",
      "title": "Report Antioquia 2024",
      "format": "PDF",
      "status": "completed",
      "region_id": 1,
      "user_id": 1,
      "fileSize": 245000,
      "generatedAt": "2024-12-19T14:30:00Z",
      "expiresAt": "2025-01-19T14:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

---

### GET /reports/:id

**Descripción:** Descarga un reporte generado.

**Petición:**
```bash
curl -X GET http://localhost:3001/api/reports/rep_001 \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -o report.pdf
```

**Response (200 OK):**
```
[Reporte binario]
```

**Response (404 Not Found):**
```json
{
  "message": "Report not found or expired",
  "code": "REP_001"
}
```

---

### DELETE /reports/:id

**Descripción:** Elimina un reporte.

**Roles Autorizados:** admin, owner del reporte

**Petición:**
```bash
curl -X DELETE http://localhost:3001/api/reports/rep_001 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "message": "Report deleted successfully"
}
```

---

## 📦 DATASETS

### GET /datasets

**Descripción:** Retorna lista de fuentes de datos disponibles.

**Petición:**
```bash
curl -X GET http://localhost:3001/api/datasets \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "MEN Official Data",
      "source": "MEN",
      "description": "Datos oficiales del Ministerio de Educación",
      "recordCount": 1200,
      "lastUpdated": "2024-12-18T00:00:00Z",
      "status": "active"
    },
    {
      "id": 2,
      "name": "DANE Statistics",
      "source": "DANE",
      "description": "Datos del Departamento Administrativo Nacional",
      "recordCount": 2265,
      "lastUpdated": "2024-12-18T00:00:00Z",
      "status": "active"
    }
  ],
  "total": 2
}
```

---

### POST /datasets

**Descripción:** Crea un nuevo dataset (solo admin).

**Roles Autorizados:** admin

**Request Body:**
```json
{
  "name": "Custom Dataset",
  "source": "CUSTOM",
  "description": "Datos personalizados",
  "dataUrl": "https://example.com/data.csv"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "Custom Dataset",
  "source": "CUSTOM",
  "status": "processing",
  "createdAt": "2024-12-19T15:00:00Z"
}
```

---

## ⚙️ ETL (Extract, Transform, Load)

### POST /etl/update

**Descripción:** Ejecuta el proceso ETL para actualizar datos.

**Roles Autorizados:** admin

**Petición:**
```bash
curl -X POST http://localhost:3001/api/etl/update \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -d '{}'
```

**Response (202 Accepted):**
```json
{
  "jobId": "etl_job_001",
  "status": "processing",
  "startedAt": "2024-12-19T15:30:00Z",
  "estimatedCompletion": "2024-12-19T16:00:00Z"
}
```

**Response (200 OK - si ya está completado):**
```json
{
  "jobId": "etl_job_001",
  "status": "completed",
  "startedAt": "2024-12-19T15:30:00Z",
  "completedAt": "2024-12-19T15:45:00Z",
  "recordsProcessed": 3465,
  "recordsCreated": 245,
  "recordsUpdated": 3220,
  "errors": 0
}
```

---

### GET /etl/logs

**Descripción:** Retorna historial de ejecuciones ETL.

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| status | string | pending, processing, completed, failed |
| source | string | Filtrar por fuente |
| limit | integer | Registros (default: 50) |

**Petición:**
```bash
curl -X GET "http://localhost:3001/api/etl/logs?status=completed&limit=20" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "source": "EXTERNAL_APIS",
      "status": "completed",
      "recordsProcessed": 3465,
      "recordsCreated": 245,
      "recordsUpdated": 3220,
      "errors": 0,
      "startTime": "2024-12-19T15:30:00Z",
      "endTime": "2024-12-19T15:45:00Z",
      "duration": 900,
      "log": "Proceso completado exitosamente"
    }
  ],
  "total": 150,
  "page": 1
}
```

---

### GET /etl/logs/:id

**Descripción:** Retorna detalles de una ejecución ETL específica.

**Petición:**
```bash
curl -X GET http://localhost:3001/api/etl/logs/1 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "source": "EXTERNAL_APIS",
  "status": "completed",
  "startTime": "2024-12-19T15:30:00Z",
  "endTime": "2024-12-19T15:45:00Z",
  "duration": 900,
  "recordsProcessed": 3465,
  "recordsCreated": 245,
  "recordsUpdated": 3220,
  "recordsSkipped": 0,
  "errors": 0,
  "details": {
    "menApiRecords": 1200,
    "daneApiRecords": 2265,
    "validationErrors": [],
    "warnings": [
      "5 records had missing values"
    ]
  },
  "fullLog": "..."
}
```

---

## 🔄 COMPARACIÓN Y ALERTAS

### GET /comparison

**Descripción:** Compara indicadores entre regiones.

**Query Parameters:**
```
regions: 1,2,3 (comma-separated)
indicator: cobertura_bruta
year: 2024
```

**Response:**
```json
{
  "indicator": "cobertura_bruta",
  "year": 2024,
  "comparison": [
    { "region": "Antioquia", "value": 87.5 },
    { "region": "Bogotá", "value": 92.3 }
  ],
  "gap": {
    "detected": true,
    "gapPercentage": 4.8,
    "severity": "low",
    "maxValue": 92.3,
    "minValue": 87.5
  }
}
```

---

## 🚨 CÓDIGOS DE ERROR

### Errores de Autenticación (400-401)

| Código | Mensaje | Solución |
|--------|---------|----------|
| AUTH_001 | Invalid credentials | Verificar email y contraseña |
| AUTH_002 | User not found | Registrarse primero |
| AUTH_003 | Email already registered | Usar otro email o login |
| AUTH_004 | Invalid or expired token | Generar nuevo token |

### Errores de Validación (400)

| Código | Mensaje | Solución |
|--------|---------|----------|
| VAL_001 | Invalid filters provided | Revisar parámetros de query |
| VAL_002 | Invalid request body | Revisar estructura JSON |
| VAL_003 | Missing required fields | Completar todos los campos obligatorios |

### Errores de Recurso (404-409)

| Código | Mensaje | Solución |
|--------|---------|----------|
| RES_001 | Resource not found | Verificar ID del recurso |
| RES_002 | Resource already exists | El recurso ya está registrado |

### Errores de Servidor (500)

| Código | Mensaje | Solución |
|--------|---------|----------|
| SRV_001 | Database connection error | Verificar conexión a BD |
| SRV_002 | External API error | Reintentar más tarde |

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### Header de Autenticación

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles y Permisos

| Operación | Admin | Analyst | Viewer |
|-----------|-------|---------|--------|
| Ver indicadores | ✅ | ✅ | ✅ |
| Generar reportes | ✅ | ✅ | ✅ |
| Crear datasets | ✅ | ❌ | ❌ |
| Ejecutar ETL | ✅ | ❌ | ❌ |
| Eliminar reportes | ✅ | Propios | ❌ |
| Ver logs | ✅ | ❌ | ❌ |

---

## 📊 RATE LIMITING

**Límites por tipo de usuario:**
- Admin: 10,000 requests/hora
- Analyst: 5,000 requests/hora
- Viewer: 1,000 requests/hora

**Header de respuesta:**
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4995
X-RateLimit-Reset: 1703087400
```

---

## 📝 EJEMPLOS DE FLUJOS COMPLETOS

### Flujo 1: Autenticación → Obtener Indicadores → Generar Reporte

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | jq -r '.token')

# 2. Obtener indicadores
curl -X GET "http://localhost:3001/api/indicators?region_id=1&year=2024" \
  -H "Authorization: Bearer $TOKEN"

# 3. Generar reporte
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": 1,
    "format": "PDF",
    "includeTrends": true
  }' \
  -o report.pdf
```

---

## 🧪 TESTING DE API

### Postman Collection

Se incluye `EduData_Postman_Collection.json` con:
- ✅ 45+ requests pre-configurados
- ✅ Variables de entorno (dev, staging, prod)
- ✅ Scripts de prueba automatizados
- ✅ Ejemplos de respuestas

### cURL Examples

Todos los ejemplos están documentados en cada endpoint arriba.

---

**Documento Versión:** 1.0.0  
**Última Actualización:** 2024-12-19  
**Estado:** ✅ COMPLETO

Para soporte: support@proyectoedudata.com
