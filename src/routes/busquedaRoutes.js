const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Obtener historial de búsquedas del usuario
router.get('/historial', authMiddleware, async (req, res) => {
  try {
    const busquedas = await prisma.busqueda.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        categoria: true,
        subcategoria: true,
        item: true,
        servicio: true,
        marca: true,
      },
    });

    res.json({
      success: true,
      data: busquedas,
    });
  } catch (error) {
    logger.error('Error en historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
    });
  }
});

// Eliminar una búsqueda
router.delete('/historial/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const busqueda = await prisma.busqueda.findUnique({
      where: { id: parseInt(id) },
    });

    if (!busqueda) {
      return res.status(404).json({
        success: false,
        message: 'Búsqueda no encontrada',
      });
    }

    if (busqueda.usuarioId !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta búsqueda',
      });
    }

    await prisma.busqueda.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Búsqueda eliminada exitosamente',
    });
  } catch (error) {
    logger.error('Error al eliminar búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar búsqueda',
    });
  }
});

module.exports = router;