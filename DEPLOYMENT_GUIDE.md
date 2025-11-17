# 🚀 DEPLOYMENT & OPERATIONS GUIDE - ProyectoEduData

**Versión:** 1.0.0  
**Fecha:** 2024-12-19  
**Ambientes Soportados:** Development, Staging, Production

---

## 📋 TABLA DE CONTENIDOS

1. [Setup Inicial](#setup-inicial)
2. [Desarrollo Local](#desarrollo-local)
3. [Ambiente Staging](#ambiente-staging)
4. [Ambiente Producción](#ambiente-producción)
5. [Docker & Contenedorización](#docker--contenedorización)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Backup y Recovery](#backup-y-recovery)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 SETUP INICIAL

### Requisitos del Sistema

**Backend:**
- Node.js v22.14.0+ (recomendado v22.x LTS)
- npm v10.0.0+ o yarn v3.0.0+
- MySQL 8.0+
- Git v2.3.0+

**Frontend:**
- Node.js v22.14.0+
- npm v10.0.0+

**Opcional:**
- Docker & Docker Compose v20.10+
- Git Large File Storage (LFS) si hay archivos >100MB

### Instalación de Dependencias Globales

#### Windows PowerShell:

```powershell
# Instalar Node.js si no está
winget install OpenJS.NodeJS.LTS

# Verificar instalación
node --version
npm --version

# Instalar MySQL (si no está en servidor remoto)
winget install MySQL.Server

# Instalar Docker Desktop
winget install Docker.DockerDesktop
```

#### macOS:

```bash
# Usar Homebrew
brew install node@22
brew install mysql@8.0
brew install docker

# Verificar
node --version
npm --version
```

#### Linux (Ubuntu/Debian):

```bash
# Node.js
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt-get install -y mysql-server-8.0

# Docker
sudo apt-get install -y docker.io docker-compose
```

---

## 🖥️ DESARROLLO LOCAL

### 1. Clonar Repositorio

```bash
git clone https://github.com/your-org/ProyectoEduData.git
cd ProyectoEduData
```

### 2. Configurar Variables de Entorno

#### Backend `.env`:

```bash
# Backend/.env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=edudata_dev
DB_USER=root
DB_PASSWORD=root_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_dev_only_change_in_prod
JWT_EXPIRATION=7d

# APIs Externas
MEN_API_URL=https://www.datos.gov.co/api/
DANE_API_URL=https://www.dane.gov.co/index.php/

# Frontend
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

#### Frontend `.env.development`:

```bash
# Frontend/.env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=EduData Dev
VITE_LOG_LEVEL=debug
```

### 3. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Crear Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# En MySQL CLI
CREATE DATABASE edudata_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'edudata_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON edudata_dev.* TO 'edudata_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Ejecutar Migraciones y Seed

```bash
# Backend (desde backend/)
npm run seed

# Verificar que la BD está poblada
mysql -u root -p edudata_dev -e "SELECT COUNT(*) FROM Indicators;"
```

### 6. Iniciar Servicios

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output:
# ✅ Database connected
# 🚀 Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Output:
# VITE v5.x.x  ready in xx ms
# ➜  Local:   http://localhost:5173/
```

### 7. Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

### 8. Ejecutar Tests

```bash
# Backend - Tests unitarios
cd backend
npm test

# Con cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

---

## 🌐 AMBIENTE STAGING

### Consideraciones de Staging

- Usa BD similar a producción pero con datos de prueba
- Permite validación pre-release
- Expone a usuarios de prueba
- Monitoreo similar a producción

### Deploy en Servidor Linux

#### 1. Preparar Servidor

```bash
# SSH al servidor
ssh user@staging.yourdomain.com

# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Crear directorio de aplicación
sudo mkdir -p /var/www/edudata
sudo chown $USER:$USER /var/www/edudata

# Instalar dependencias
sudo apt-get install -y nodejs npm mysql-server-8.0 nginx git
```

#### 2. Configurar Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/edudata

upstream edudata_backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name staging.yourdomain.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem;

    # Backend API
    location /api {
        proxy_pass http://edudata_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        root /var/www/edudata/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
    gzip_min_length 1024;
}
```

#### 3. Configurar PM2 para Node.js

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Crear archivo de configuración
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "edudata-api",
    script: "./backend/server.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "staging",
      PORT: 3001
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true
  }]
};
EOF

# Iniciar aplicación
pm2 start ecosystem.config.js

# Hacer que inicie con el sistema
pm2 startup
pm2 save

# Ver estado
pm2 status
pm2 logs
```

#### 4. Variables de Entorno Staging

```bash
# /var/www/edudata/backend/.env (staging)
NODE_ENV=staging
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=edudata_staging
DB_USER=edudata_user
DB_PASSWORD=your_staging_password

JWT_SECRET=your_staging_jwt_secret_change_regularly
JWT_EXPIRATION=24h

MEN_API_URL=https://www.datos.gov.co/api/
DANE_API_URL=https://www.dane.gov.co/index.php/

FRONTEND_URL=https://staging.yourdomain.com

LOG_LEVEL=info
LOG_DIR=/var/log/edudata

ALLOWED_ORIGINS=https://staging.yourdomain.com
```

#### 5. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --nginx -d staging.yourdomain.com

# Auto-renovación (automática con certbot)
sudo certbot renew --dry-run
```

---

## 🏭 AMBIENTE PRODUCCIÓN

### Pre-Requisitos de Producción

- [ ] Dominio configurado
- [ ] Certificado SSL válido
- [ ] Servidor con mínimo 2 CPUs, 4GB RAM, 20GB storage
- [ ] Base de datos en servidor dedicado o managed service
- [ ] Backups automáticos configurados
- [ ] Monitoreo y alertas activas
- [ ] Plan de recuperación ante desastres
- [ ] Auditoría y logging centralizado

### Arquitectura Recomendada

```
[Load Balancer (AWS ALB / Azure App Gateway)]
        ↓
[Application Servers (Min 2 instances)]
    ├── Node.js + PM2
    ├── Nginx reverse proxy
    └── Application logs
        ↓
[Database (RDS / Managed MySQL)]
    ├── Automated backups
    └── Read replicas
```

### Deploy en AWS

#### 1. Crear Instancia EC2

```bash
# AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name my-key \
  --security-groups web-server \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=edudata-prod}]'
```

#### 2. RDS MySQL Setup

```bash
# Crear instancia RDS
aws rds create-db-instance \
  --db-instance-identifier edudata-prod-db \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0.28 \
  --master-username admin \
  --master-user-password 'SecurePassword123!' \
  --allocated-storage 100 \
  --multi-az \
  --backup-retention-period 30
```

#### 3. Configurar Environment Variables en Producción

```bash
# Usar AWS Secrets Manager
aws secretsmanager create-secret \
  --name edudata/prod/db \
  --secret-string '{
    "DB_HOST":"edudata-db.xxxxx.us-east-1.rds.amazonaws.com",
    "DB_USER":"admin",
    "DB_PASSWORD":"SecurePassword123!",
    "DB_NAME":"edudata_prod"
  }'

# En .env (servidor)
aws secretsmanager get-secret-value \
  --secret-id edudata/prod/db \
  --query SecretString \
  --output text > .env
```

#### 4. CloudFront para Static Assets

```bash
# Crear distribución CloudFront
aws cloudfront create-distribution \
  --origin-domain-name s3.yourbucket.amazonaws.com \
  --default-root-object index.html
```

### Deploy en Azure

#### 1. Crear App Service

```bash
# CLI de Azure
az group create --name edudata-prod --location eastus

az appservice plan create \
  --name edudata-plan \
  --resource-group edudata-prod \
  --sku B2

az webapp create \
  --name edudata-prod-api \
  --resource-group edudata-prod \
  --plan edudata-plan \
  --runtime "node|22"
```

#### 2. Configurar Application Insights

```bash
# Crear Application Insights
az monitor app-insights component create \
  --app edudata-insights \
  --location eastus \
  --resource-group edudata-prod

# Agregar al App Service
az webapp config appsettings set \
  --name edudata-prod-api \
  --resource-group edudata-prod \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=<KEY>
```

### Checklist de Seguridad Producción

- [ ] HTTPS/TLS 1.3 habilitado
- [ ] Firewall configurado (only required ports)
- [ ] DDoS protection activo
- [ ] SQL injection prevention (parameterized queries ✅)
- [ ] XSS protection headers configurados
- [ ] CORS restringido a dominios conocidos
- [ ] Rate limiting en endpoints públicos
- [ ] Credenciales rotadas cada 90 días
- [ ] API keys almacenadas en secrets manager
- [ ] Logs centralizados y monitoreados
- [ ] Alertas para eventos de seguridad

### Secrets Management

```bash
# Usar variables de entorno (nunca commitear)
# Almacenar en:
# - AWS Secrets Manager
# - Azure Key Vault
# - HashiCorp Vault

# Nunca hacer esto:
echo "PASSWORD=mysecret" >> .env
git add .env
```

---

## 🐳 DOCKER & CONTENEDORIZACIÓN

### Dockerfile Backend

```dockerfile
# Dockerfile.backend
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
```

### Dockerfile Frontend

```dockerfile
# Dockerfile.frontend
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: edudata-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - edudata-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edudata-backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      NODE_ENV: ${NODE_ENV}
      PORT: 3001
      DB_HOST: mysql
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3001:3001"
    networks:
      - edudata-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: edudata-frontend
    ports:
      - "80:80"
    networks:
      - edudata-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: edudata-nginx
    depends_on:
      - backend
      - frontend
    ports:
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - edudata-network

volumes:
  mysql-data:

networks:
  edudata-network:
    driver: bridge
```

### Ejecutar con Docker Compose

```bash
# Desarrollo
docker-compose -f docker-compose.yml up

# Producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f backend

# Escalar servicios
docker-compose up -d --scale backend=3

# Detener
docker-compose down
```

---

## 📊 MONITOREO Y LOGS

### Configuración de Logs

```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'edudata-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Monitoreo con Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'edudata-api'
    static_configs:
      - targets: ['localhost:3001']

  - job_name: 'mysql'
    static_configs:
      - targets: ['localhost:9104']
```

### Alertas en Prometheus + Alertmanager

```yaml
# alerts.yml
groups:
- name: edudata
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "High error rate detected"

  - alert: DatabaseDown
    expr: up{job="mysql"} == 0
    annotations:
      summary: "Database is down"
```

### Centralized Logging Stack

```bash
# Usar ELK Stack (Elasticsearch, Logstash, Kibana)
# O CloudWatch (AWS)
# O Log Analytics (Azure)

# Ejemplo Docker Compose con ELK
docker run -d --name elasticsearch -p 9200:9200 docker.elastic.co/elasticsearch/elasticsearch:8.5.0
docker run -d --name kibana -p 5601:5601 docker.elastic.co/kibana/kibana:8.5.0
```

---

## 💾 BACKUP Y RECOVERY

### Backup Automático de Base de Datos

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/mysql"
DB_NAME="edudata_prod"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
mysqldump -u root -p${DB_PASSWORD} \
  --single-transaction \
  --quick \
  --lock-tables=false \
  ${DB_NAME} > ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# Comprimir
gzip ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# Mantener últimos 30 días
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete

# Subir a S3 (opcional)
aws s3 cp ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz s3://edudata-backups/

echo "✅ Backup completado: ${DB_NAME}_${DATE}.sql.gz"
```

### Scheduling con Cron

```bash
# /etc/cron.d/edudata-backup
0 2 * * * root /var/www/edudata/scripts/backup.sh

# Ejecuta diariamente a las 2 AM
```

### Restore desde Backup

```bash
# Listar backups disponibles
ls -lh /backups/mysql/

# Restaurar
gunzip < /backups/mysql/edudata_prod_20241219_020000.sql.gz | \
  mysql -u root -p${DB_PASSWORD} edudata_prod

# O desde S3
aws s3 cp s3://edudata-backups/edudata_prod_20241219_020000.sql.gz . && \
  gunzip < edudata_prod_20241219_020000.sql.gz | \
  mysql -u root -p${DB_PASSWORD} edudata_prod
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Cannot connect to database"

```bash
# 1. Verificar que MySQL está ejecutándose
systemctl status mysql
sudo systemctl start mysql

# 2. Verificar credenciales
mysql -u ${DB_USER} -p${DB_PASSWORD} -h ${DB_HOST} -e "SELECT 1"

# 3. Verificar conectividad
nc -zv ${DB_HOST} 3306

# 4. Ver logs de MySQL
tail -f /var/log/mysql/error.log
```

### Problema: "Port 3001 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3002
```

### Problema: "Memory leak / High memory usage"

```bash
# Monitorear memoria
top -b -n 1 | grep node

# Reiniciar con PM2
pm2 restart 0

# Aumentar limites de Node
export NODE_OPTIONS=--max-old-space-size=4096
npm start
```

### Problema: "API timeout"

```bash
# Aumentar timeouts en nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# O en Node.js
server.setTimeout(120000);
```

### Problema: "Certificate error"

```bash
# Renovar Let's Encrypt
sudo certbot renew --force-renewal

# Verificar fecha de expiración
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Todos los tests pasando (`npm test`)
- [ ] Código revisado y aprobado (code review)
- [ ] Dependencias actualizadas y auditadas (`npm audit`)
- [ ] Variables de entorno configuradas
- [ ] Backup de BD realizado
- [ ] Plan de rollback preparado

### Deployment

- [ ] Detener servicios actuales
- [ ] Backup de código actual
- [ ] Descargar nueva versión (`git pull`)
- [ ] Instalar dependencias (`npm install`)
- [ ] Ejecutar migraciones (si aplica)
- [ ] Iniciar servicios (`pm2 start`)
- [ ] Verificar health checks
- [ ] Ejecutar smoke tests

### Post-Deployment

- [ ] Monitorear logs durante 1 hora
- [ ] Verificar funcionamiento completo
- [ ] Validar métricas de rendimiento
- [ ] Notificar al equipo
- [ ] Documentar cambios

---

**Documento Versión:** 1.0.0  
**Última Actualización:** 2024-12-19  
**Estado:** ✅ COMPLETO

### Soporte
Para problemas de deployment, contactar: devops@proyectoedudata.com
