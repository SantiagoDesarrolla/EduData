// backend/src/routes/datasetRoutes.js
const express = require('express');
const DatasetController = require('../controllers/DatasetController');
const router = express.Router();

router.get('/', DatasetController.getAll);
router.get('/:id', DatasetController.getById);
router.post('/', DatasetController.create);
router.put('/:id', DatasetController.update);
router.delete('/:id', DatasetController.delete);

module.exports = router;
