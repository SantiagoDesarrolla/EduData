// backend/scripts/seedDatabase.js
require('dotenv').config();
const { Region, Indicator, Dataset, User, sequelize } = require('../src/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando poblamiento de base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');

    // Si quieres limpiar todo antes del seed, descomenta la siguiente línea
    // await sequelize.sync({ force: true });

    // 1. Crear 32 Regiones (departamentos)
    const regionDefinitions = [
      { name: 'Amazonas', code: 'AMA', type: 'departamento', latitude: -1.4578, longitude: -69.9421 },
      { name: 'Antioquia', code: 'ANT', type: 'departamento', latitude: 6.2442, longitude: -75.5812 },
      { name: 'Arauca', code: 'ARA', type: 'departamento', latitude: 7.0883, longitude: -70.7606 },
      { name: 'Atlántico', code: 'ATL', type: 'departamento', latitude: 10.9639, longitude: -74.7966 },
      { name: 'Bolívar', code: 'BOL', type: 'departamento', latitude: 9.5076, longitude: -75.5077 },
      { name: 'Boyacá', code: 'BOY', type: 'departamento', latitude: 5.5319, longitude: -73.3670 },
      { name: 'Caldas', code: 'CAL', type: 'departamento', latitude: 5.0689, longitude: -75.5174 },
      { name: 'Caquetá', code: 'CAQ', type: 'departamento', latitude: 1.6077, longitude: -74.0820 },
      { name: 'Casanare', code: 'CAS', type: 'departamento', latitude: 5.0131, longitude: -71.9363 },
      { name: 'Cauca', code: 'CAU', type: 'departamento', latitude: 2.4489, longitude: -76.6068 },
      { name: 'Cesar', code: 'CES', type: 'departamento', latitude: 9.3370, longitude: -73.6536 },
      { name: 'Chocó', code: 'CHO', type: 'departamento', latitude: 5.0327, longitude: -77.3055 },
      { name: 'Córdoba', code: 'COR', type: 'departamento', latitude: 8.7840, longitude: -75.8432 },
      { name: 'Cundinamarca', code: 'CUN', type: 'departamento', latitude: 5.0330, longitude: -74.2973 },
      { name: 'Guainía', code: 'GUA', type: 'departamento', latitude: 3.8980, longitude: -67.9221 },
      { name: 'Guaviare', code: 'GVR', type: 'departamento', latitude: 2.5756, longitude: -72.6396 },
      { name: 'Huila', code: 'HUI', type: 'departamento', latitude: 2.5359, longitude: -75.5277 },
      { name: 'La Guajira', code: 'LAG', type: 'departamento', latitude: 11.4650, longitude: -72.9635 },
      { name: 'Magdalena', code: 'MAG', type: 'departamento', latitude: 10.4110, longitude: -74.1971 },
      { name: 'Meta', code: 'MET', type: 'departamento', latitude: 4.1496, longitude: -73.6269 },
      { name: 'Nariño', code: 'NAR', type: 'departamento', latitude: 1.2146, longitude: -77.2811 },
      { name: 'Norte de Santander', code: 'NDS', type: 'departamento', latitude: 7.9465, longitude: -72.8989 },
      { name: 'Putumayo', code: 'PUT', type: 'departamento', latitude: 0.2540, longitude: -76.9354 },
      { name: 'Quindío', code: 'QUI', type: 'departamento', latitude: 4.5510, longitude: -75.6676 },
      { name: 'Risaralda', code: 'RIS', type: 'departamento', latitude: 4.8529, longitude: -75.6909 },
      { name: 'San Andrés y Providencia', code: 'SAP', type: 'departamento', latitude: 12.5847, longitude: -81.7008 },
      { name: 'Santander', code: 'SAN', type: 'departamento', latitude: 7.1193, longitude: -73.1227 },
      { name: 'Sucre', code: 'SUC', type: 'departamento', latitude: 9.3087, longitude: -75.3798 },
      { name: 'Tolima', code: 'TOL', type: 'departamento', latitude: 4.4389, longitude: -75.2322 },
      { name: 'Valle del Cauca', code: 'VAC', type: 'departamento', latitude: 3.7418, longitude: -76.5225 },
      { name: 'Vaupés', code: 'VAP', type: 'departamento', latitude: 1.1931, longitude: -69.9740 },
      { name: 'Vichada', code: 'VIC', type: 'departamento', latitude: 4.5551, longitude: -68.1470 },
    ];

    const regions = await Region.bulkCreate(regionDefinitions, { ignoreDuplicates: true });
    console.log(`✅ ${regions.length} regiones creadas/aseguradas`);

    // 2. Crear algunos Datasets (fuentes)
    const datasetsDefs = [
      {
        name: 'MEN - Datos Abiertos',
        description: 'Datos educativos del Ministerio de Educación Nacional',
        source_url: 'https://www.datos.gov.co/api/views/m5pv-qtbe',
        last_update: new Date(),
        update_frequency: 'monthly',
      },
      {
        name: 'DANE - Población',
        description: 'Datos demográficos del DANE',
        source_url: 'https://www.dane.gov.co',
        last_update: new Date(),
        update_frequency: 'yearly',
      },
      {
        name: 'Encuestas Escolares - Indicadores 2018-2024',
        description: 'Encuestas y reportes históricos',
        source_url: 'https://example.org/encuestas',
        last_update: new Date(),
        update_frequency: 'yearly',
      },
    ];

    const datasets = await Dataset.bulkCreate(datasetsDefs, { ignoreDuplicates: true });
    console.log(`✅ ${datasets.length} datasets creados/asegurados`);

    // 3. Definir muchos tipos de indicadores
    const indicatorTypes = [
      { code: 'cobertura_bruta', name: 'Cobertura Bruta', unit: '%' },
      { code: 'cobertura_neta', name: 'Cobertura Neta', unit: '%' },
      { code: 'tasa_desercion', name: 'Tasa de Deserción', unit: '%' },
      { code: 'tasa_reprobacion', name: 'Tasa de Reprobación', unit: '%' },
      { code: 'tasa_promocion', name: 'Tasa de Promoción', unit: '%' },
      { code: 'tasa_terminacion_primaria', name: 'Tasa de Terminación Primaria', unit: '%' },
      { code: 'tasa_terminacion_secundaria', name: 'Tasa de Terminación Secundaria', unit: '%' },
      { code: 'alfabetizacion', name: 'Tasa de Alfabetización', unit: '%' },
      { code: 'rel_alumnos_docente', name: 'Relación Alumnos-Docente', unit: 'ratio' },
      { code: 'promedio_matematicas', name: 'Promedio Matemáticas', unit: 'pts' },
      { code: 'promedio_lectura', name: 'Promedio Lectura', unit: 'pts' },
      { code: 'infra_escuelas_con_internet', name: 'Escuelas con Internet', unit: '%' },
      { code: 'infra_escuelas_agua', name: 'Escuelas con Agua Potable', unit: '%' },
      { code: 'gasto_por_estudiante', name: 'Gasto por Estudiante', unit: 'COP' },
      { code: 'matricula_total', name: 'Matrícula Total', unit: 'persons' },
    ];

    // 4. Generar indicadores para cada región, indicador y año (2018-2024)
    const indicators = [];
    const startYear = 2018;
    const endYear = 2024;

    // Map regions result to ensure we have ids (bulkCreate may return instances or not depending on dialect)
    const allRegions = await Region.findAll();
    const datasetPrimary = await Dataset.findOne({ where: { name: 'MEN - Datos Abiertos' } });
    const datasetId = datasetPrimary ? datasetPrimary.id : datasets[0].id;

    for (let year = startYear; year <= endYear; year++) {
      for (const region of allRegions) {
        for (const indType of indicatorTypes) {
          // Generate plausible random values depending on unit
          let value = null;
          switch (indType.unit) {
            case '%':
              value = +(Math.random() * 100).toFixed(2);
              break;
            case 'ratio':
              value = +(Math.random() * 60).toFixed(2); // e.g., 0-60
              break;
            case 'pts':
              value = +(Math.random() * 500).toFixed(2); // score out of 500
              break;
            case 'COP':
              value = +(Math.round(Math.random() * 5_000_000));
              break;
            case 'persons':
              value = Math.floor(Math.random() * 100000);
              break;
            default:
              value = +(Math.random() * 100).toFixed(2);
          }

          indicators.push({
            region_id: region.id,
            dataset_id: datasetId,
            indicator_code: indType.code,
            indicator_name: indType.name,
            value: value,
            unit: indType.unit,
            year: year,
            metadata: { seeded: true },
          });
        }
      }
    }

    console.log(`ℹ️ Se crearán aproximadamente ${indicators.length} indicadores (puede tardar)`);
    // Bulk insert en bloques para evitar problemas de memoria
    const chunkSize = 1000;
    for (let i = 0; i < indicators.length; i += chunkSize) {
      const chunk = indicators.slice(i, i + chunkSize);
      await Indicator.bulkCreate(chunk, { ignoreDuplicates: true });
      console.log(`  - Insertados ${Math.min(i + chunkSize, indicators.length)} / ${indicators.length}`);
    }

    // 5. Crear usuario de prueba (opcional)
    const existingUser = await User.findOne({ where: { email: 'admin@edudata.co' } });
    if (!existingUser) {
      await User.create({
        email: 'admin@edudata.co',
        password: 'test123', // En producción, esto debe estar hasheado
        role: 'admin',
        name: 'Admin EduData',
      });
      console.log('✅ Usuario admin creado');
    }

    console.log('\n✨ ¡Base de datos poblada exitosamente!');
    console.log(`📊 Total regiones: ${allRegions.length}, indicadores estimados: ${indicators.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al popular base de datos:', error);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seedDatabase();
