// backend/src/models/Region.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Region = sequelize.define('Region', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
      comment: 'Código DANE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('departamento', 'municipio'),
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'regions',
        key: 'id',
      },
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
    },
  }, {
    tableName: 'regions',
    timestamps: true,
  });

  return Region;
};
