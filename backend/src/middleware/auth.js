// backend/src/middleware/auth.js - NUEVO
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ROLES, ERROR_MESSAGES } = require('../utils/constants');

const authMiddleware = {
  // Verificar token JWT
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED,
        details: 'Token de acceso requerido'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED,
        details: 'Token inválido o expirado'
      });
    }
  },

  // Verificar rol específico
  requireRole: (role) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          message: ERROR_MESSAGES.UNAUTHORIZED 
        });
      }

      if (req.user.role !== role && req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ 
          message: 'Acceso denegado. Permisos insuficientes.',
          requiredRole: role,
          userRole: req.user.role
        });
      }

      next();
    };
  },

  // Verificar múltiples roles
  requireAnyRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          message: ERROR_MESSAGES.UNAUTHORIZED 
        });
      }

      if (!roles.includes(req.user.role) && req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ 
          message: 'Acceso denegado. Rol no autorizado.',
          authorizedRoles: roles,
          userRole: req.user.role
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;