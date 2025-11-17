// backend/src/models/Indicator.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Indicator = sequelize.define('Indicator', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    region_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'regions',
        key: 'id',
      },
    },
    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'datasets',
        key: 'id',
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    indicator_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Ej: cobertura_bruta, desercion',
    },
    indicator_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'indicators',
    timestamps: true,
  });

  return Indicator;
};
