// backend/src/services/ETLService.js - VERSIÓN CORREGIDA
const { Dataset, Indicator, Region, ETLLog } = require('../models');
const ExternalAPIService = require('./ExternalAPIService');

// Constantes locales (elimina la dependencia de constants.js)
const MAIN_INDICATORS = {
  COBERTURA_BRUTA: 'cobertura_bruta',
  DESERCION: 'desercion_escolar', 
  REPITENCIA: 'repitencia',
  APROBACION: 'tasa_aprobacion',
  EFICIENCIA: 'eficiencia_interna'
};

const ETLService = {
  async runETL(datasetId) {
    const dataset = await Dataset.findByPk(datasetId);
    if (!dataset) throw new Error('Dataset no encontrado');

    const startTime = new Date();
    let log;

    try {
      log = await ETLLog.create({
        dataset_id: dataset.id,
        status: 'processing',
        started_at: startTime,
      });

      console.log(`🔄 Iniciando ETL para: ${dataset.name}`);
      
      // Obtener datos según el tipo de dataset - MEJORADO
      let rawData;
      try {
        if (dataset.name.includes('MEN') || dataset.source_type === 'MEN') {
          rawData = await ExternalAPIService.fetchMENData();
        } else if (dataset.name.includes('DANE') || dataset.source_type === 'DANE') {
          rawData = await ExternalAPIService.fetchDANEData();
        } else {
          // Para datasets locales
          console.log('📋 Usando datos locales existentes');
          const indicators = await Indicator.findAll({ 
            where: { dataset_id: dataset.id },
            limit: 100,
            include: [{ model: Region }]
          });
          rawData = indicators.map(ind => ({
            codigo_dane: ind.Region?.code || '11',
            departamento: ind.Region?.name || 'Bogotá D.C.',
            año: ind.year,
            indicador: ind.indicator_code,
            nombre_indicador: ind.indicator_name,
            valor: ind.value,
            unidad_medida: ind.unit
          }));
        }
      } catch (apiError) {
        console.error('❌ Error obteniendo datos externos:', apiError.message);
        throw new Error(`Fallo en conexión API: ${apiError.message}`);
      }

      // Validar datos obtenidos
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('No se obtuvieron datos válidos de la fuente');
      }

      console.log(`📥 Datos obtenidos: ${rawData.length} registros`);

      // Procesar y cargar datos - MEJORADO
      let processedCount = 0;
      let errorCount = 0;
      
      for (const item of rawData.slice(0, 200)) { // Aumentado a 200 registros
        try {
          // Validar item básico
          if (!item.codigo_dane && !item.departamento) {
            console.warn('⚠️ Item sin código DANE ni departamento, omitiendo:', item);
            errorCount++;
            continue;
          }

          // Buscar o crear región - MEJORADO
          let region = await this.findOrCreateRegion(item);
          
          if (!region) {
            console.warn('⚠️ No se pudo crear/encontrar región para:', item);
            errorCount++;
            continue;
          }

          // Determinar indicador basado en dataset
          const indicatorConfig = this.getIndicatorConfig(dataset.name, item);
          
          // Crear o actualizar indicador
          await Indicator.upsert({
            region_id: region.id,
            dataset_id: dataset.id,
            year: item.año || 2024,
            indicator_code: indicatorConfig.code,
            indicator_name: indicatorConfig.name,
            value: parseFloat(item.valor) || null,
            unit: item.unidad_medida || '%',
            metadata: {
              fuente: dataset.name,
              fecha_actualizacion: new Date().toISOString(),
              item_original: item // Guardar datos originales para debugging
            }
          }, {
            conflictFields: ['region_id', 'dataset_id', 'year', 'indicator_code']
          });

          processedCount++;
          
          // Log cada 50 registros
          if (processedCount % 50 === 0) {
            console.log(`📊 Procesados ${processedCount} registros...`);
          }
          
        } catch (itemError) {
          console.warn(`⚠️ Error procesando item:`, itemError.message);
          errorCount++;
        }
      }

      // Actualizar dataset
      dataset.last_update = new Date();
      dataset.records_count = processedCount;
      await dataset.save();

      // Completar log - MEJORADO
      log.status = errorCount > 0 ? 'completed_with_errors' : 'success';
      log.records_processed = processedCount;
      log.records_failed = errorCount;
      log.completed_at = new Date();
      await log.save();

      console.log(`✅ ETL completado: ${processedCount} registros procesados, ${errorCount} errores`);
      return { 
        success: true, 
        processed: processedCount,
        errors: errorCount,
        total: rawData.length
      };

    } catch (error) {
      console.error('❌ Error en ETL:', error);
      if (log) {
        log.status = 'error';
        log.error_message = error.message;
        log.completed_at = new Date();
        await log.save();
      }
      throw error;
    }
  },

  // Helper: Buscar o crear región - NUEVO MÉTODO
  async findOrCreateRegion(item) {
    const code = item.codigo_dane || '11';
    const name = item.departamento || 'Bogotá D.C.';
    
    // Validar código DANE (2 dígitos para departamentos)
    if (!/^\d{2}$/.test(code)) {
      console.warn(`⚠️ Código DANE inválido: ${code}, usando fallback`);
    }

    try {
      // Buscar región existente
      let region = await Region.findOne({ 
        where: { code: code } 
      });
      
      if (!region) {
        // Determinar tipo basado en el código y nombre
        let type = 'departamento';
        if (name.includes('Bogotá') || code === '11') {
          type = 'distrito_capital';
        } else if (name.includes('Archipiélago') || code === '88') {
          type = 'territorio_indigena';
        }
        
        region = await Region.create({
          code: code,
          name: name,
          type: type,
          metadata: {
            fuente: 'ETL',
            fecha_creacion: new Date().toISOString()
          }
        });
        console.log(`📍 Nueva región creada: ${name} (${code})`);
      }
      
      return region;
    } catch (regionError) {
      console.error('❌ Error creando/buscando región:', regionError.message);
      return null;
    }
  },

  // Helper: Determinar configuración de indicador - NUEVO MÉTODO
  getIndicatorConfig(datasetName, item) {
    const indicatorMap = {
      'cobertura': { code: MAIN_INDICATORS.COBERTURA_BRUTA, name: 'Cobertura Bruta' },
      'deserción': { code: MAIN_INDICATORS.DESERCION, name: 'Tasa de Deserción Escolar' },
      'repitencia': { code: MAIN_INDICATORS.REPITENCIA, name: 'Tasa de Repitencia' },
      'aprobación': { code: MAIN_INDICATORS.APROBACION, name: 'Tasa de Aprobación' },
      'eficiencia': { code: MAIN_INDICATORS.EFICIENCIA, name: 'Eficiencia Interna' }
    };

    // Buscar en el nombre del dataset
    const datasetLower = datasetName.toLowerCase();
    for (const [key, config] of Object.entries(indicatorMap)) {
      if (datasetLower.includes(key)) {
        return config;
      }
    }

    // Buscar en el item
    if (item.indicador) {
      const itemLower = item.indicador.toLowerCase();
      for (const [key, config] of Object.entries(indicatorMap)) {
        if (itemLower.includes(key)) {
          return config;
        }
      }
    }

    // Default
    return { 
      code: item.indicador || MAIN_INDICATORS.COBERTURA_BRUTA, 
      name: item.nombre_indicador || 'Indicador Educativo' 
    };
  },

  // Ejecutar ETL para todos los datasets activos - MEJORADO
  async runAllETL() {
    const datasets = await Dataset.findAll({ 
      where: { is_active: true },
      order: [['priority', 'ASC']] 
    });
    
    console.log(`🔄 Iniciando ETL para ${datasets.length} datasets activos`);
    
    const results = [];
    for (const dataset of datasets) {
      try {
        console.log(`\n📁 Procesando dataset: ${dataset.name}`);
        const result = await this.runETL(dataset.id);
        results.push({ dataset: dataset.name, ...result });
        
        // Pequeña pausa entre datasets
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error en dataset ${dataset.name}:`, error.message);
        results.push({ 
          dataset: dataset.name, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Resumen final
    const successCount = results.filter(r => r.success).length;
    const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0);
    
    console.log(`\n🎯 ETL COMPLETADO: ${successCount}/${datasets.length} datasets exitosos, ${totalProcessed} registros totales`);
    return results;
  },

  // Nuevo método: Probar ETL con un dataset específico
  async testETL(datasetId) {
    console.log('🧪 Ejecutando ETL de prueba...');
    const result = await this.runETL(datasetId);
    console.log('🧪 Resultado de prueba:', result);
    return result;
  }
};

module.exports = ETLService;