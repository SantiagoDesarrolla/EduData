// backend/src/controllers/RegionController.js
const { Region } = require("../models");

const RegionController = {
  // Obtener todas las regiones
  async getAll(req, res) {
    try {
      const regions = await Region.findAll({
        order: [["name", "ASC"]],
      });
      res.status(200).json(regions);
    } catch (error) {
      console.error("❌ Error al obtener regiones:", error);
      res.status(500).json({ message: "Error al obtener regiones" });
    }
  },

  // Obtener una región por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const region = await Region.findByPk(id);
      if (!region) return res.status(404).json({ message: "Región no encontrada" });
      res.status(200).json(region);
    } catch (error) {
      console.error("❌ Error al obtener región:", error);
      res.status(500).json({ message: "Error al obtener región" });
    }
  },

  // Crear una región
  async create(req, res) {
    try {
      const region = await Region.create(req.body);
      res.status(201).json(region);
    } catch (error) {
      console.error("❌ Error al crear región:", error);
      res.status(500).json({ message: "Error al crear región" });
    }
  },
};

module.exports = RegionController;
