// backend/src/models/Report.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    filters: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Filtros aplicados (JSON)',
    },
    report_type: {
      type: DataTypes.ENUM('comparison', 'regional', 'trend'),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    format: {
      type: DataTypes.ENUM('pdf', 'csv'),
      allowNull: true,
    },
    generated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'reports',
    timestamps: true,
  });

  return Report;
};
