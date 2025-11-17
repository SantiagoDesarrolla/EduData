# Manual de Usuario - ProyectoEduData

Bienvenido al Manual de Usuario de ProyectoEduData. Este documento explica, paso a paso, las funcionalidades principales de la plataforma y muestra fragmentos de código y comandos útiles para usuarios, administradores y desarrolladores.

---

## Público objetivo
- Usuarios finales (analistas, gestores educativos)
- Administradores del sistema
- Desarrolladores que necesiten entender flujos y ejemplos de código

## Requisitos previos
- Navegador moderno (Chrome, Edge, Firefox)
- Acceso a la URL de despliegue o a la instancia local
- Credenciales de usuario (email/contraseña)

---

## Acceso e inicio de sesión

1. Abra la URL de la aplicación (p.ej. `https://edu-data.example.org`).
2. En la pantalla de login introduzca su correo y contraseña.
3. Pulse `Iniciar sesión`.

Si no tiene cuenta, use la opción `Registrarse` (si está habilitada) o contacte al administrador.

Problemas frecuentes:
- Contraseña incorrecta: use `¿Olvidó su contraseña?` o contacte al administrador.
- Cuenta bloqueada: revisar con el equipo de operaciones.

---

## Estructura general de la interfaz

- **Barra superior**: acceso rápido, perfil y notificaciones.
- **Panel lateral**: navegación por módulos (Dashboard, Indicadores, Mapas, Reportes, Administración).
- **Área principal**: visualizaciones, tablas y controles.

---

## Funcionalidad principal: Consultar indicadores

Descripción: Buscar, filtrar y visualizar indicadores por región, periodo y categoría.

Pasos:
1. Abra el módulo `Indicadores` desde el panel lateral.
2. En el filtro superior seleccione:
   - `Región`: elija una o varias (p. ej. Bogotá, Antioquia).
   - `Año` o rango de años.
   - `Categoría` o tipo de indicador si aplica.
3. Pulse `Aplicar filtros`.
4. La tabla mostrará las filas filtradas; haga clic en cualquier indicador para ver detalles y gráficos de tendencia.

Consejos:
- Use la búsqueda rápida para localizar indicadores por nombre o código.
- Ordene columnas para identificar valores máximos/mínimos.

---

## Ver tendencias (gráficos)

1. Dentro del detalle de un indicador, verá un gráfico de líneas con la serie temporal.
2. Use controles de rango (ej. 2018-2024) para ajustar el eje X.
3. Active/desactive series comparativas (otras regiones) en la leyenda.

Exportar gráfico: botón `Exportar` → PNG / CSV (los datos subyacentes).

---

## Mapas interactivos

1. Abra el módulo `Mapas`.
2. Seleccione el indicador a visualizar en el mapa.
3. El mapa coloreará regiones por valor (choropleth).
4. Use la herramienta de `Seleccionar regiones` para comparar varias áreas.

Interacción:
- Hover: muestra tooltip con valor y año.
- Click: abre detalle del indicador para la región seleccionada.

---

## Generar reportes

1. Vaya al módulo `Reportes`.
2. Pulse `Generar nuevo reporte`.
3. Configure:
   - Título
   - Indicadores a incluir
   - Regiones
   - Período
   - Formato (PDF / Excel / CSV)
4. Pulse `Generar`.
5. El sistema encolará la generación y le notificará cuando el reporte esté listo (descargar desde la lista de reportes).

Notas:
- Para reportes pesados, espere unos minutos; la generación es asíncrona.

---

## Exportar datos (CSV)

1. Desde cualquier tabla de resultados, pulse `Exportar` → `CSV`.
2. El archivo se descargará con el conjunto de filas y columnas filtradas.

Comando `curl` (API) para exportar indicadores en CSV:

```bash
curl -X GET "https://api.edu-data.example.org/indicators/export?region=Antioquia&year=2022" \
  -H "Authorization: Bearer <TOKEN>" -o indicadores_antioquia_2022.csv
```

---

## Administración básica (usuarios y datasets)

Acceso: `Administración` → `Usuarios`.

Funciones típicas:
- Crear/editar usuarios y asignar roles (Admin, Analyst, Viewer).
- Subir nuevo dataset (CSV) desde `Datasets` → `Nuevo`.
- Validar y mapear columnas a indicadores existentes.

---

## Actualizar datos (ETL)

Los administradores pueden ejecutar procesos ETL para sincronizar datos externos.

Pasos (interfaz):
1. `Administración` → `ETL` → `Ejecutar actualización`.
2. Seleccione fuente (MEN / DANE / CSV local) y periodo.
3. Inicie la ejecución y verifique logs en `ETL Logs`.

Comando API (por ejemplo, disparar ETL):

```bash
curl -X POST "https://api.edu-data.example.org/etl/update" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source":"MEN","year":2024}'
```

---

## Ejecutar localmente (Guía rápida para usuarios técnicos)

Requisitos: Node.js 18+ (recomendado 22), npm, MySQL o Docker.

Backend (PowerShell):

```powershell
cd backend
npm install
# crear .env según .env.example
npm run seed    # popular BD (si procede)
npm run dev     # o npm start según package.json
```

Frontend (PowerShell):

```powershell
cd frontend
npm install
npm run dev
# Abra http://localhost:5173 (o puerto indicado)
```

Nota: Si `npm run seed` falla, revise la configuración de la base de datos en `backend/config/database.js` y las variables de entorno.

---

## Fragmentos de código (ejemplos representativos)

### Ruta Express: obtener indicadores

```js
// backend/routes/indicatorRoutes.js
const express = require('express');
const router = express.Router();
const IndicatorController = require('../controllers/IndicatorController');

router.get('/', IndicatorController.getIndicators);
module.exports = router;
```

### Controlador (extracto)

```js
// backend/controllers/IndicatorController.js
const { Indicator } = require('../models');

exports.getIndicators = async (req, res, next) => {
  try {
    const { region, year, q } = req.query;
    const where = {};
    if (region) where.region = region;
    if (year) where.year = year;
    if (q) where.name = { [Op.like]: `%${q}%` };

    const indicators = await Indicator.findAll({ where, limit: 100 });
    res.json({ data: indicators });
  } catch (err) {
    next(err);
  }
};
```

### Modelo Sequelize: Indicator (extracto)

```js
// backend/models/Indicator.js
module.exports = (sequelize, DataTypes) => {
  const Indicator = sequelize.define('Indicator', {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    region: { type: DataTypes.STRING },
    year: { type: DataTypes.INTEGER },
    value: { type: DataTypes.FLOAT }
  });
  return Indicator;
};
```

### Hook React: useIndicators (extracto)

```ts
// frontend/hooks/useIndicators.ts
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';

export default function useIndicators(params) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/indicators', { params })
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading };
}
```

### Servicio ETL: ejemplo de función de transformación

```js
// backend/services/ETLService.js
async function transformRow(row) {
  return {
    code: row['indicador_codigo'],
    name: row['nombre_indicador'],
    region: normalizeRegion(row['departamento']),
    year: Number(row['ano']),
    value: parseFloat(row['valor']) || null,
  };
}
```

---

## Resolución de problemas rápidos

- No puedo iniciar el backend: revisar variables de entorno y acceso a la BD.
- Seed falla: comprobar que la BD existe y el usuario tiene permisos.
- Errores 401/403 en API: revisar token JWT y permisos de rol.
- Reporte no generado: mirar `ETL Logs` y colas de proceso.

Si necesita soporte, prepare:
1. Captura de pantalla del error
2. Logs del backend (archivo `logs/*.log` o salida de PM2)
3. Pasos reproducibles

---

## Contacto y soporte
Para problemas de producción contacte al equipo de operaciones o abra un ticket interno con la información solicitada en la sección de troubleshooting.

---

## Historial y versión del documento
- Versión: 1.0
- Fecha: 2025-11-16
- Autor: Equipo de Desarrollo - ProyectoEduData

---

Si quieres, puedo:
- Añadir capturas de pantalla y diagramas paso a paso.
- Traducir a inglés.
- Extraer automáticamente fragmentos de código reales desde los archivos del repo.

Fin del Manual de Usuario.
