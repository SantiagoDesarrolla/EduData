// backend/src/routes/api.js
const express = require('express');
const router = express.Router();
const ExternalAPIService = require('../services/ExternalAPIService');

// Probar conexión con APIs externas
router.get('/test-connection', async (req, res) => {
    try {
        const result = await ExternalAPIService.testConnection();
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Obtener datos del MEN
router.get('/men-data', async (req, res) => {
    try {
        const { dataset, limit } = req.query;
        const data = await ExternalAPIService.fetchMENData(dataset, limit);
        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
