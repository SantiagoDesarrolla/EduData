const { Report, Indicator, Region, Dataset } = require('../models');
const ReportGeneratorService = require('../services/ReportGeneratorService');
const { REPORT_TYPES, FILE_FORMATS } = require('../utils/constants');

const ReportController = {
  // 📘 Obtener todos los reportes
  async getAll(req, res) {
    try {
      const reports = await Report.findAll({
        include: [Region, Dataset],
        order: [['generated_at', 'DESC']],
      });
      res.status(200).json(reports);
    } catch (error) {
      console.error('❌ Error al obtener reportes:', error);
      res.status(500).json({ message: 'Error al obtener reportes' });
    }
  },

  // 🔍 Obtener un reporte por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const report = await Report.findByPk(id, {
        include: [Region, Dataset],
      });
      if (!report)
        return res.status(404).json({ message: 'Reporte no encontrado' });
      res.status(200).json(report);
    } catch (error) {
      console.error('❌ Error al obtener reporte:', error);
      res.status(500).json({ message: 'Error al obtener reporte' });
    }
  },

  // 📊 Crear reporte dinámico (personalizado)
  async create(req, res) {
    try {
      const { title, filters, report_type, format } = req.body;

      if (!REPORT_TYPES.includes(report_type)) {
        return res.status(400).json({ message: 'Tipo de reporte no válido' });
      }

      const indicators = await Indicator.findAll({
        where: { ...filters },
        include: [Region, Dataset],
      });

      let filePath;
      if (format === 'pdf') {
        filePath = await ReportGeneratorService.generatePDF(title, indicators);
      } else if (format === 'csv') {
        filePath = await ReportGeneratorService.generateCSV(title, indicators);
      }

      const report = await Report.create({
        title,
        filters,
        report_type,
        format,
        file_path: filePath,
        user_id: req.user?.id || null,
      });

      res.status(201).json({
        message: '✅ Reporte generado correctamente',
        report,
      });
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      res.status(500).json({ message: 'Error al generar reporte' });
    }
  },

  // ✏️ Actualizar un reporte existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Report.update(req.body, { where: { id } });
      if (!updated)
        return res.status(404).json({ message: 'Reporte no encontrado' });
      const report = await Report.findByPk(id);
      res
        .status(200)
        .json({ message: '✅ Reporte actualizado correctamente', report });
    } catch (error) {
      console.error('❌ Error al actualizar reporte:', error);
      res.status(500).json({ message: 'Error al actualizar reporte' });
    }
  },

  // 🗑️ Eliminar un reporte
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Report.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: 'Reporte no encontrado' });
      res.status(200).json({ message: '✅ Reporte eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error al eliminar reporte:', error);
      res.status(500).json({ message: 'Error al eliminar reporte' });
    }
  },

  // 🧭 Filtrar reportes por tipo, año o región
  async filterReports(req, res) {
    try {
      const { type, year, region } = req.query;
      const where = {};

      if (type) where.report_type = type;
      if (year) where.filters = { year };
      if (region) where.filters = { region };

      const reports = await Report.findAll({ where });
      res.status(200).json(reports);
    } catch (error) {
      console.error('❌ Error filtrando reportes:', error);
      res.status(500).json({ message: 'Error al filtrar reportes' });
    }
  },
};

module.exports = ReportController;
