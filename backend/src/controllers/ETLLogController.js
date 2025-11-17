const { ETLLog, Dataset } = require('../models');

const ETLLogController = {
  // 📘 Obtener todos los logs ETL
  async getAll(req, res) {
    try {
      const logs = await ETLLog.findAll({
        include: [{ model: Dataset, attributes: ['id', 'name', 'source_url'] }],
        order: [['started_at', 'DESC']],
      });
      res.status(200).json(logs);
    } catch (error) {
      console.error('❌ Error al obtener logs ETL:', error);
      res.status(500).json({ message: 'Error al obtener logs ETL' });
    }
  },

  // 🔍 Obtener log ETL por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const log = await ETLLog.findByPk(id, {
        include: [{ model: Dataset }],
      });
      if (!log) return res.status(404).json({ message: 'Log ETL no encontrado' });
      res.status(200).json(log);
    } catch (error) {
      console.error('❌ Error al obtener log ETL:', error);
      res.status(500).json({ message: 'Error al obtener log ETL' });
    }
  },

  // ➕ Registrar un nuevo log ETL
  async create(req, res) {
    try {
      const log = await ETLLog.create(req.body);
      res.status(201).json({
        message: '✅ Registro ETL creado correctamente',
        log,
      });
    } catch (error) {
      console.error('❌ Error al crear log ETL:', error);
      res.status(500).json({ message: 'Error al crear log ETL' });
    }
  },

  // ✏️ Actualizar un log existente (por ejemplo, marcarlo como completado)
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await ETLLog.update(req.body, { where: { id } });
      if (!updated)
        return res.status(404).json({ message: 'Log ETL no encontrado' });
      const log = await ETLLog.findByPk(id);
      res.status(200).json({
        message: '✅ Log ETL actualizado correctamente',
        log,
      });
    } catch (error) {
      console.error('❌ Error al actualizar log ETL:', error);
      res.status(500).json({ message: 'Error al actualizar log ETL' });
    }
  },

  // 🗑️ Eliminar un log ETL
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ETLLog.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: 'Log ETL no encontrado' });
      res.status(200).json({ message: '✅ Log ETL eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error al eliminar log ETL:', error);
      res.status(500).json({ message: 'Error al eliminar log ETL' });
    }
  },
};

module.exports = ETLLogController;
