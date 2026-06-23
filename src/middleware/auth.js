const { verifyToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Token no proporcionado',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: true,
        message: 'Token inválido o expirado',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no encontrado',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    logger.error('Error en authMiddleware:', error);
    return res.status(500).json({
      error: true,
      message: 'Error al autenticar',
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: true,
        message: 'No autenticado',
      });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para acceder a este recurso',
      });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};