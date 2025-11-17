const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// ✅ Registro de usuarios
router.post('/register', AuthController.register);

// ✅ Inicio de sesión
router.post('/login', AuthController.login);

module.exports = router;
