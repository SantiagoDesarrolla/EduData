const express = require('express');
const router = express.Router();
const ETLLogController = require('../controllers/ETLLogController');

// 📘 Obtener todos los logs ETL
router.get('/', ETLLogController.getAll);

// 🔍 Obtener un log por ID
router.get('/:id', ETLLogController.getById);

// ➕ Crear nuevo registro ETL
router.post('/', ETLLogController.create);

// ✏️ Actualizar log ETL
router.put('/:id', ETLLogController.update);

// 🗑️ Eliminar log ETL
router.delete('/:id', ETLLogController.delete);

module.exports = router;
