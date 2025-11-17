// backend/src/models/Dataset.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dataset = sequelize.define('Dataset', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    source_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'URL API oficial',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    update_frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      defaultValue: 'monthly',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'datasets',
    timestamps: true,
  });

  return Dataset;
};


