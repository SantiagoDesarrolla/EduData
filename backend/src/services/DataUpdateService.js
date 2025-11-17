const ETLService = require('./ETLService');
const { Dataset } = require('../models');

const DataUpdateService = {
  async updateAll() {
    const datasets = await Dataset.findAll({ where: { is_active: true } });
    console.log(`🔄 Iniciando actualización para ${datasets.length} datasets`);
    for (const ds of datasets) {
      await ETLService.runETL(ds.id);
    }
    console.log('✅ Actualización completa de todos los datasets');
  },
};

module.exports = DataUpdateService;
