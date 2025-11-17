const { ROLES } = require('../utils/constants');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos suficientes' });
    }

    next();
  };
}

module.exports = authorizeRoles;
