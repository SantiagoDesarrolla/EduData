const { Dataset, ETLLog } = require('../models');

const DatasetController = {
  // 📘 Obtener todos los datasets registrados
  async getAll(req, res) {
    try {
      const datasets = await Dataset.findAll({
        include: [{ model: ETLLog }], // Opcional: mostrar registros ETL asociados
        order: [['id', 'ASC']],
      });
      res.status(200).json(datasets);
    } catch (error) {
      console.error('❌ Error al obtener datasets:', error);
      res.status(500).json({ message: 'Error al obtener datasets' });
    }
  },

  // 🔍 Obtener dataset por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const dataset = await Dataset.findByPk(id, {
        include: [{ model: ETLLog }],
      });
      if (!dataset)
        return res.status(404).json({ message: 'Dataset no encontrado' });
      res.status(200).json(dataset);
    } catch (error) {
      console.error('❌ Error al obtener dataset:', error);
      res.status(500).json({ message: 'Error al obtener dataset' });
    }
  },

  // ➕ Crear un nuevo dataset
  async create(req, res) {
    try {
      const dataset = await Dataset.create(req.body);
      res.status(201).json({
        message: '✅ Dataset creado correctamente',
        dataset,
      });
    } catch (error) {
      console.error('❌ Error al crear dataset:', error);
      res.status(500).json({ message: 'Error al crear dataset' });
    }
  },

  // ✏️ Actualizar dataset existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Dataset.update(req.body, { where: { id } });
      if (!updated)
        return res.status(404).json({ message: 'Dataset no encontrado' });
      const dataset = await Dataset.findByPk(id);
      res.status(200).json({
        message: '✅ Dataset actualizado correctamente',
        dataset,
      });
    } catch (error) {
      console.error('❌ Error al actualizar dataset:', error);
      res.status(500).json({ message: 'Error al actualizar dataset' });
    }
  },

  // 🗑️ Eliminar dataset
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Dataset.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ message: 'Dataset no encontrado' });
      res
        .status(200)
        .json({ message: '✅ Dataset eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error al eliminar dataset:', error);
      res.status(500).json({ message: 'Error al eliminar dataset' });
    }
  },

  // 🔄 Actualizar fecha de última sincronización (para ETL)
  async updateLastSync(req, res) {
    try {
      const { id } = req.params;
      const dataset = await Dataset.findByPk(id);
      if (!dataset)
        return res.status(404).json({ message: 'Dataset no encontrado' });

      dataset.last_update = new Date();
      await dataset.save();

      res.status(200).json({
        message: '✅ Fecha de actualización sincronizada correctamente',
        last_update: dataset.last_update,
      });
    } catch (error) {
      console.error('❌ Error al sincronizar dataset:', error);
      res.status(500).json({ message: 'Error al sincronizar dataset' });
    }
  },
};

module.exports = DatasetController;
