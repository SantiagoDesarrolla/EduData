// backend/src/models/ETLLog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ETLLog = sequelize.define('ETLLog', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'datasets',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('success', 'error', 'warning'),
      allowNull: false,
    },
    records_processed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'etl_logs',
    timestamps: true,
  });

  return ETLLog;
};
