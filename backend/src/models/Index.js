// backend/src/models/Index.js
// Use the configured sequelize instance and require models from the same folder
const { sequelize } = require('../config/database');
const RegionModel = require('./Region');
const DatasetModel = require('./Dataset');
const IndicatorModel = require('./Indicator');
const ReportModel = require('./Report');
const ETLLogModel = require('./ETLLog');
const UserModel = require('./User');

// Inicialización de modelos con la instancia de sequelize
const Region = RegionModel(sequelize);
const Dataset = DatasetModel(sequelize);
const Indicator = IndicatorModel(sequelize);
const Report = ReportModel(sequelize);
const ETLLog = ETLLogModel(sequelize);
const User = UserModel(sequelize);

// Relaciones
Region.hasMany(Indicator, { foreignKey: 'region_id', onDelete: 'CASCADE' });
Indicator.belongsTo(Region, { foreignKey: 'region_id' });

Dataset.hasMany(Indicator, { foreignKey: 'dataset_id', onDelete: 'CASCADE' });
Indicator.belongsTo(Dataset, { foreignKey: 'dataset_id' });

Region.hasMany(Report, { foreignKey: 'region_id', onDelete: 'CASCADE' });
Report.belongsTo(Region, { foreignKey: 'region_id' });

Dataset.hasMany(Report, { foreignKey: 'dataset_id', onDelete: 'SET NULL' });
Report.belongsTo(Dataset, { foreignKey: 'dataset_id' });

Dataset.hasMany(ETLLog, { foreignKey: 'dataset_id', onDelete: 'CASCADE' });
ETLLog.belongsTo(Dataset, { foreignKey: 'dataset_id' });

User.hasMany(Report, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Report.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  Region,
  Dataset,
  Indicator,
  Report,
  ETLLog,
  User,
};
