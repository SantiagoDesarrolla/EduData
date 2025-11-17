const express = require('express');
const router = express.Router();

// Importar todas las rutas
const regionRoutes = require('./regionRoutes');
const datasetRoutes = require('./datasetRoutes');
const indicatorRoutes = require('./indicatorRoutes');
const reportRoutes = require('./reportRoutes');
const etlRoutes = require('./etlRoutes');
const authRoutes = require('./authRoutes');
const apiRoutes = require('./api'); // ← NUEVA LÍNEA

// Asignar rutas con prefijos
router.use('/regions', regionRoutes);
router.use('/datasets', datasetRoutes);
router.use('/indicators', indicatorRoutes);
router.use('/reports', reportRoutes);
router.use('/etl-logs', etlRoutes);
router.use('/auth', authRoutes);
router.use('/api', apiRoutes); // ← NUEVA LÍNEA

module.exports = router;