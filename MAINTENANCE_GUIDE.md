# 🛠️ MAINTENANCE & TROUBLESHOOTING GUIDE - ProyectoEduData

**Versión:** 1.0.0  
**Fecha:** 2024-12-19  
**Objetivo:** Guía completa para mantenimiento, diagnóstico y resolución de problemas

---

## 📋 TABLA DE CONTENIDOS

1. [Tareas de Mantenimiento Rutinario](#tareas-de-mantenimiento-rutinario)
2. [Monitoreo del Sistema](#monitoreo-del-sistema)
3. [Optimización de Rendimiento](#optimización-de-rendimiento)
4. [Troubleshooting Backend](#troubleshooting-backend)
5. [Troubleshooting Frontend](#troubleshooting-frontend)
6. [Troubleshooting Base de Datos](#troubleshooting-base-de-datos)
7. [Incident Management](#incident-management)
8. [Documentación de Incidentes](#documentación-de-incidentes)

---

## 🔄 TAREAS DE MANTENIMIENTO RUTINARIO

### Diaria

#### 1. Verificar Logs de Errores

```bash
# Backend
tail -f logs/error.log

# Frontend (check console en DevTools)
# Si hay muchos errores: analizar causas

# Base de datos
tail -f /var/log/mysql/error.log
```

#### 2. Monitorear Recursos del Sistema

```bash
# Revisar uso de CPU/Memoria
top -b -n 1 | head -20

# Ideal:
# CPU: < 70%
# Memoria: < 80%
# Disk: < 85%

# Si alguno está alto, investigar proceso:
ps aux | sort -k3 -r | head
```

#### 3. Verificar Status de Servicios

```bash
# PM2 status
pm2 status

# Nginx
systemctl status nginx

# MySQL
systemctl status mysql

# Si alguno está down, reiniciar:
pm2 restart 0
sudo systemctl restart nginx
sudo systemctl restart mysql
```

#### 4. Revisar Health Endpoint

```bash
# Backend health check
curl http://localhost:3001/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2024-12-19T10:30:00Z",
  "uptime": 86400,
  "database": "connected"
}

# Si database está down, verificar conexión MySQL
```

### Semanal

#### 1. Actualizar Dependencias

```bash
# Ver vulnerabilidades
npm audit

# Actualizar dependencias de seguridad
npm audit fix

# Revisar actualizaciones disponibles
npm outdated

# Actualizar selectivamente
npm update --save
```

#### 2. Revisar Backups

```bash
# Verificar que se ejecutaron
ls -lh /backups/mysql/ | tail -10

# Verificar integridad del backup más reciente
gunzip -t /backups/mysql/edudata_prod_latest.sql.gz

# Hacer test restore en BD de prueba
```

#### 3. Limpiar Logs Antiguos

```bash
# Comprimir logs de más de 7 días
find logs -name "*.log" -mtime +7 -exec gzip {} \;

# Eliminar logs de más de 30 días
find logs -name "*.log.gz" -mtime +30 -delete
```

#### 4. Revisar Reportes de Error

```bash
# Contar errores por tipo
grep "ERROR" logs/combined.log | cut -d' ' -f4- | sort | uniq -c | sort -rn

# Ver errores en último 1 hora
grep "$(date -d '1 hour ago' +'%Y-%m-%d %H')" logs/combined.log | grep ERROR
```

### Mensual

#### 1. Análisis de Rendimiento

```bash
# Generar reporte de rendimiento
# - Uptime: idealmente 99.9%+
# - Error rate: < 0.1%
# - Respuesta promedio: < 500ms

# Comparar con mes anterior
```

#### 2. Auditoría de Seguridad

```bash
# Verificar acceso a logs de auditoría
ls -la logs/audit.log

# Revisar intentos de login fallidos
grep "failed login" logs/audit.log | wc -l

# Revisar cambios significativos
grep "MODIFY\|DELETE\|CREATE" logs/audit.log
```

#### 3. Rotación de Credenciales

```bash
# Cambiar contraseña BD
mysql -u root -p
ALTER USER 'edudata_user'@'localhost' IDENTIFIED BY 'new_secure_password';

# Cambiar JWT_SECRET (generar nuevo)
# Advertencia: Invalida todos los tokens activos
JWT_SECRET=$(openssl rand -hex 32)

# Actualizar en .env y reiniciar servicios
```

#### 4. Revisar Uso de Almacenamiento

```bash
# Tamaño de BD
du -sh /var/lib/mysql/edudata_prod

# Tamaño de logs
du -sh logs/

# Limpiar si necesario
mysql -u root -p -e "OPTIMIZE TABLE edudata_prod.*;"
```

---

## 📊 MONITOREO DEL SISTEMA

### Dashboard de Monitoreo

**Métricas Clave a Monitorear:**

| Métrica | Ideal | Warning | Critical |
|---------|-------|---------|----------|
| CPU Usage | < 50% | 60-70% | > 80% |
| Memory Usage | < 60% | 70-80% | > 90% |
| Disk Usage | < 70% | 75-85% | > 90% |
| Response Time | < 200ms | 200-500ms | > 1s |
| Error Rate | < 0.01% | 0.01-0.1% | > 0.1% |
| DB Connections | < 50 | 50-80 | > 80 |

### Implementar con Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - 'alerts.yml'

scrape_configs:
  - job_name: 'edudata-api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

### Alertas Configuradas

```yaml
# alerts.yml
groups:
- name: edudata
  interval: 30s
  rules:
  
  - alert: HighCPUUsage
    expr: (100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
    for: 5m
    annotations:
      summary: "High CPU usage detected"
      
  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
    for: 5m
    annotations:
      summary: "High memory usage detected"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.001
    for: 5m
    annotations:
      summary: "High error rate"
```

### Grafana Dashboards

```bash
# Crear dashboards en Grafana para:
# - Request/Response times
# - Error rates by endpoint
# - Database query times
# - CPU/Memory/Disk usage
# - Active connections
# - ETL execution times
```

---

## ⚡ OPTIMIZACIÓN DE RENDIMIENTO

### Backend Optimizations

#### 1. Caching

```javascript
// backend/middleware/cache.js
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 3600) => {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `${req.originalUrl}`;
    
    client.get(key, (err, data) => {
      if (data) {
        return res.json(JSON.parse(data));
      }
      
      const originalJson = res.json;
      
      res.json = function(body) {
        client.setex(key, duration, JSON.stringify(body));
        return originalJson.call(this, body);
      };
      
      next();
    });
  };
};

// Aplicar en rutas
app.get('/api/indicators', cacheMiddleware(3600), getIndicators);
```

#### 2. Database Query Optimization

```javascript
// Agregar índices
ALTER TABLE Indicators ADD INDEX idx_region_year (region_id, year);
ALTER TABLE Indicators ADD INDEX idx_code_year (code, year);

// Usar select específico
const indicators = await Indicator.findAll({
  attributes: ['id', 'code', 'value', 'year'],  // No traer todo
  where: { region_id: 1, year: 2024 },
  raw: true  // Más rápido para solo lectura
});

// Batch queries
const [indicators, regions] = await Promise.all([
  Indicator.find(...),
  Region.find(...)
]);
```

#### 3. Compression

```javascript
// backend/app.js
const compression = require('compression');

app.use(compression({
  level: 6,
  threshold: 10 * 1024  // 10KB
}));
```

### Frontend Optimizations

#### 1. Code Splitting

```typescript
// routes/AppRoutes.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  </Suspense>
);
```

#### 2. Image Optimization

```typescript
// Usar WebP con fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.png" alt="Description" />
</picture>

// Lazy loading
<img src="indicator.png" loading="lazy" alt="Indicator" />
```

#### 3. Bundle Analysis

```bash
cd frontend

# Instalar plugin
npm install --save-dev vite-plugin-visualizer

# Analizar bundle
npm run build
npx visualizer dist/stats.html
```

### Database Optimizations

#### 1. Query Performance Analysis

```sql
-- Explicar query execution plan
EXPLAIN SELECT * FROM Indicators 
WHERE region_id = 1 AND year = 2024;

-- Buscar missing indexes
SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage 
WHERE OBJECT_SCHEMA != 'mysql' 
ORDER BY COUNT_READ DESC;
```

#### 2. Slow Query Log

```bash
# my.cnf
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

#### 3. Connection Pooling

```javascript
// backend/config/database.js
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    }
  }
);
```

---

## 🐛 TROUBLESHOOTING BACKEND

### Problema 1: API retorna 500 Internal Server Error

**Diagnóstico:**

```bash
# 1. Ver logs de error
tail -f logs/error.log

# 2. Verificar qué endpoint falla
# Nota la URL en el error

# 3. Probar directamente
curl -v http://localhost:3001/api/endpoints

# 4. Ver stack trace completo
DEBUG=* npm start
```

**Soluciones Comunes:**

```javascript
// Error: "Cannot read property 'xxx' of undefined"
// Causa: response data structure changed
// Solución: Verificar estructura de respuesta en service

// Error: "ECONNREFUSED 127.0.0.1:3306"
// Causa: MySQL no está conectado
// Solución: systemctl restart mysql

// Error: "JWT malformed"
// Causa: Token inválido o expirado
// Solución: Generar nuevo token
```

### Problema 2: Requests lento/timeout

**Diagnóstico:**

```bash
# 1. Medir tiempo de respuesta
time curl http://localhost:3001/api/indicators

# 2. Ver query lenta
EXPLAIN SELECT * FROM Indicators WHERE region_id = 1;

# 3. Ver si hay bloqueos
show processlist;

# 4. Revisar si hay conexiones idle
show status like 'Threads%';
```

**Soluciones:**

```bash
# 1. Aumentar timeout en nginx
proxy_connect_timeout 60s;

# 2. Optimizar query (agregar índice)
ALTER TABLE Indicators ADD INDEX idx_region (region_id);

# 3. Aumentar memoria Node
export NODE_OPTIONS=--max-old-space-size=2048

# 4. Usar caching
app.get('/api/indicators', cacheMiddleware(3600), handler);
```

### Problema 3: Memory leak

**Diagnóstico:**

```bash
# 1. Ver memoria en tiempo real
watch -n 1 'ps aux | grep node'

# 2. Generar heap dump
node --inspect server.js
# Luego acceder a chrome://inspect

# 3. Analizarlo
node --expose-gc --max-old-space-size=4096 server.js
```

**Soluciones:**

```javascript
// Identificar referencias circulares
app.on('error', (error) => {
  console.error('Uncaught error:', error);
});

// Usar streams para datos grandes
fs.createReadStream('large-file.csv')
  .pipe(parser)
  .pipe(processor);

// Limpiar event listeners
emitter.removeListener('event', callback);
```

---

## 🎨 TROUBLESHOOTING FRONTEND

### Problema 1: Pantalla en blanco o error 403

**Diagnóstico:**

```bash
# 1. Abrir DevTools (F12)
# 2. Ver Console para errores
# 3. Ver Network tab para fallos de requests

# 4. Verificar que backend está ejecutándose
curl http://localhost:3001/health
```

**Soluciones Comunes:**

```
Error: "CORS error"
→ Verificar que FRONTEND_URL está configurado en backend

Error: "404 not found"
→ API endpoint cambió o no existe

Error: "401 Unauthorized"
→ Token expirado, hacer login nuevamente
```

### Problema 2: Componentes no renderizan

**Diagnóstico:**

```typescript
// 1. Revisar console para errores
console.error('Component error:', error);

// 2. Usar React DevTools
// Chrome extension: React Developer Tools

// 3. Verificar data fetch
console.log('Data:', data);

// 4. Ver Network tab para requests
```

**Soluciones:**

```typescript
// Error: "Cannot read property 'map' of undefined"
// Solución: Validar que array existe antes de mapear
{indicators && indicators.length > 0 ? (
  <ul>
    {indicators.map(ind => <li key={ind.id}>{ind.name}</li>)}
  </ul>
) : (
  <p>No data</p>
)}

// Error: Componente no actualiza después de API call
// Solución: Usar useEffect con dependencies array
useEffect(() => {
  fetchData();
}, [selectedRegion, year]);
```

### Problema 3: Rendimiento lento

**Diagnóstico:**

```bash
# 1. Performance audit
npm run build
lighthouse http://localhost:3000

# 2. Ver bundle size
npm run build
npm install -D vite-plugin-visualizer

# 3. DevTools Performance tab
# Record performance y analizar flame graph
```

**Soluciones:**

```typescript
// 1. Lazy load componentes
const Reports = lazy(() => import('./pages/Reports'));

// 2. Memoize components
const MapComponent = memo(({ data }) => {...});

// 3. Usar useCallback
const handleClick = useCallback(() => {
  fetchData();
}, []);

// 4. Virtualizar listas largas
import { FixedSizeList } from 'react-window';
<FixedSizeList height={600} itemCount={3465} itemSize={35}>
  {Row}
</FixedSizeList>
```

---

## 🗄️ TROUBLESHOOTING BASE DE DATOS

### Problema 1: "Too many connections"

**Diagnóstico:**

```sql
-- Ver conexiones activas
SHOW STATUS LIKE 'Threads%';

-- Ver conexiones por usuario
SELECT USER(), COUNT(*) FROM information_schema.processlist GROUP BY USER();

-- Ver queries lentas
SHOW PROCESSLIST;
```

**Soluciones:**

```sql
-- Aumentar max connections
SET GLOBAL max_connections = 200;

-- Terminar conexiones idle
KILL CONNECTION process_id;

-- Implementar connection pooling en Node.js
pool: {
  max: 20,
  min: 5,
  idle: 10000
}
```

### Problema 2: Corrupción de datos

**Diagnóstico:**

```bash
# Ejecutar check table
mysqlcheck -u root -p --all-databases

# Verificar integridad
ANALYZE TABLE Indicators;
OPTIMIZE TABLE Indicators;
```

**Soluciones:**

```bash
# 1. Reparar tabla
REPAIR TABLE Indicators;

# 2. Restorar desde backup
mysql edudata_prod < backup.sql

# 3. Implementar validación en aplicación
if (value < 0 || value > 100) {
  throw new Error('Invalid value');
}
```

### Problema 3: Disco lleno

**Diagnóstico:**

```bash
# Ver uso de disco
df -h

# Ver tamaño de BD
du -sh /var/lib/mysql/edudata_prod

# Ver logs grandes
du -sh logs/
```

**Soluciones:**

```bash
# 1. Limpiar logs antiguos
find logs -name "*.log" -mtime +30 -delete

# 2. Comprimir backups
gzip /backups/mysql/*.sql

# 3. Archivizar data antigua
DELETE FROM Indicators WHERE year < 2020;

# 4. Expandir volumen (si es VM)
```

---

## 🚨 INCIDENT MANAGEMENT

### Severidad de Incidentes

| Nivel | Impacto | Tiempo Respuesta | Ejemplo |
|-------|---------|------------------|---------|
| **P1 (Critical)** | Servicio down, sin usuarios acceso | 15 min | API no responde |
| **P2 (High)** | Funcionalidad degradada | 1 hora | Reportes lentos |
| **P3 (Medium)** | Feature bug pero workaround existe | 4 horas | Error al exportar |
| **P4 (Low)** | Cosméticos o optimización | 1 día | UI misaligned |

### Flujo de Respuesta

```
1. DETECCIÓN
   ├─ Alert automático
   ├─ Report de usuario
   └─ Health check

2. TRIAGE (5 min)
   ├─ Asignar severidad
   ├─ Identificar sistema afectado
   └─ Notificar equipo

3. DIAGNÓSTICO (15 min)
   ├─ Recolectar logs/metrics
   ├─ Reproducir problema
   └─ Identificar causa raíz

4. MITIGACIÓN (30 min)
   ├─ Implementar fix temporal
   ├─ Validar que funciona
   └─ Actualizar status

5. RESOLUCIÓN (1 día)
   ├─ Fix permanente
   ├─ Testing completo
   └─ Deploy en producción

6. POST-MORTEM (Día siguiente)
   ├─ Documentar qué pasó
   ├─ Identificar mejoras
   └─ Implementar preventivos
```

### Runbook para P1 Incident

```bash
#!/bin/bash
# scripts/incident_response.sh

# 1. Verificar status
echo "=== Checking API Status ==="
curl -f http://localhost:3001/health || echo "API DOWN"

# 2. Revisar logs
echo "=== Recent Errors ==="
tail -50 logs/error.log

# 3. Reiniciar servicios
echo "=== Restarting Services ==="
pm2 restart 0
systemctl restart nginx
systemctl restart mysql

# 4. Verificar nuevamente
sleep 10
curl -f http://localhost:3001/health && echo "✅ API RESTORED"

# 5. Notificar
echo "Incident recovery attempted at $(date)" | \
  mail -s "P1 Incident Response" oncall@company.com
```

---

## 📝 DOCUMENTACIÓN DE INCIDENTES

### Template Post-Mortem

```markdown
# Post-Mortem: [Título del Incident]

## Resumen Ejecutivo
[Descripción breve: qué pasó, cuánto tiempo down, impacto]

## Timeline

| Hora | Evento |
|------|--------|
| 14:30 | Alert: Error rate > 5% |
| 14:35 | Equipo notificado |
| 14:40 | Identificada: Memory leak en ExternalAPIService |
| 14:55 | Deploy fix |
| 15:00 | Sistema normalizado |

## Causa Raíz

ExternalAPIService tenía event listener no removido en cada llamada API.
Después de ~1000 llamadas, memoria excedida y proceso crasheó.

## Impacto

- Downtime: 30 minutos
- Usuarios afectados: ~2000
- Reportes fallidos: 150
- Pérdida estimada: $5000

## Acción Tomada

1. Reinicié procesos manualmente
2. Deploy fix con pruebas adicionales

## Mejoras Preventivas

### Inmediatas (esta semana)
- [ ] Code review de ExternalAPIService
- [ ] Agregar memory leak detection
- [ ] Aumentar alertas de memoria

### Corto plazo (este mes)
- [ ] Load testing automatizado
- [ ] Circuit breaker para APIs externas
- [ ] Better monitoring

### Largo plazo (próximo trimestre)
- [ ] Refactorizar arquitectura de services
- [ ] Implementar chaos engineering
- [ ] Disaster recovery drills mensuales

## Seguimiento

- Owner: [Nombre]
- Review date: [Fecha]
- Status: Open
```

### Ejemplos de Incidentes Documentados

#### Incident #001: Database Connection Leak (2024-01-15)

```
Causa: Pool de conexiones no cerradas en paginated queries
Síntoma: "Too many connections" después de 4 horas
Resolución: Implementar connection lifecycle management
Duracion: 45 minutos downtime
```

#### Incident #002: ETL Timeout (2024-02-03)

```
Causa: DANE API cambió respuesta format
Síntoma: ETL proceso falla silenciosamente
Resolución: Agregar validation y logging mejor
Duracion: Detectado 6 horas después (sin downtime visible)
```

#### Incident #003: JWT Token Validation Bug (2024-03-10)

```
Causa: Cambio de librería jwt sin compatibility testing
Síntoma: 50% de users no pueden login
Resolución: Revert cambio y proper testing procedure
Duracion: 15 minutos downtime
```

---

## 📊 SLA y Uptime Tracking

### SLA Targets

```
API Uptime: 99.9% (43.2 minutos downtime/mes)
  - Frontend: 99.95%
  - Backend: 99.9%
  - Database: 99.99%

Response Time: P95 < 500ms
Error Rate: < 0.1%
```

### Uptime Dashboard

```bash
# Track histórico
# Uptime current month: 99.92%
# Uptime last quarter: 99.94%
# Uptime all time: 99.91%

# SLA violations this month: 1
# - Feb 10: Database maintenance (scheduled, excluded)
```

---

## 🔄 Escalation Matrix

```
Problema                  → Responsable          → Si no responde → Si no responde
─────────────────────────────────────────────────────────────────────────────
P1: API Down             → On-call Engineer     → Team Lead      → CTO
P2: Feature Degraded     → Feature Owner        → Team Lead      → Engineering Mgr
P3: Data Issue           → DBA                  → Tech Lead      → CTO
P4: Performance          → DevOps               → Team Lead      → Engineering Mgr
```

---

**Documento Versión:** 1.0.0  
**Última Actualización:** 2024-12-19  
**Estado:** ✅ COMPLETO

### Escalation Emergency
- On-Call: +1-XXX-XXX-XXXX
- Slack: #incident-response
- Email: oncall@company.com
