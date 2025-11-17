// backend/src/routes/indicatorRoutes.js - COMPLETO
const express = require("express");
const IndicatorController = require("../controllers/IndicatorController");
const router = express.Router();

// 📊 Rutas de indicadores
router.get("/", IndicatorController.getAll); // Con paginación y filtros básicos
router.get("/map", IndicatorController.getMapData); // RF-01: Datos para mapa
router.get("/region/:regionId", IndicatorController.getByRegion); // RF-02: Por región
router.post("/compare", IndicatorController.compareRegions); // RF-03: Comparación
router.get("/trends", IndicatorController.getTrends); // RF-08: Tendencias
router.post("/filter", IndicatorController.advancedFilter); // RF-09, RF-16: Filtros avanzados
router.get("/available", IndicatorController.getAvailableIndicators); // Lista indicadores

module.exports = router;