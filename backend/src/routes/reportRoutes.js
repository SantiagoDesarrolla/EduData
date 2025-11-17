// backend/src/routes/reportRoutes.js
const express = require('express');
const ReportController = require('../controllers/ReportController');
const router = express.Router();

router.get('/', ReportController.getAll);
router.get('/:id', ReportController.getById);
router.post('/', ReportController.create);
router.put('/:id', ReportController.update);
router.delete('/:id', ReportController.delete);

module.exports = router;
