const { PrismaClient } = require('@prisma/client');
const { cacheGet, cacheSet } = require('../config/redis');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function getServicios(req, res) {
  try {
    const cacheKey = 'servicios_lista';
    let data = await cacheGet(cacheKey);

    if (!data) {
      data = await prisma.servicio.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      });
      await cacheSet(cacheKey, data, 3600);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error en getServicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios',
    });
  }
}

async function buscarServicios(req, res) {
  try {
    const { servicioId } = req.query;

    if (!servicioId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere servicioId',
      });
    }

    const servicio = await prisma.servicio.findUnique({
      where: { 
        id: parseInt(servicioId),
        activo: true,
      },
    });

    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado',
      });
    }

    if (req.usuario) {
      await prisma.busqueda.create({
        data: {
          usuarioId: req.usuario.id,
          servicioId: servicio.id,
          resultado: servicio,
        },
      });
    }

    res.json({
      success: true,
      data: servicio,
    });
  } catch (error) {
    logger.error('Error en buscarServicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar servicio',
    });
  }
}

module.exports = {
  getServicios,
  buscarServicios,
};