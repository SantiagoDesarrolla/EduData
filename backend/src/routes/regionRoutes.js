// backend/src/routes/regionRoutes.js
const express = require("express");
const RegionController = require("../controllers/RegionController");
const router = express.Router();

router.get("/", RegionController.getAll);
router.get("/:id", RegionController.getById);
router.post("/", RegionController.create);

module.exports = router;
