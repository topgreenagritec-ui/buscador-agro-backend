const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { cacheGet, cacheSet } = require('../config/redis');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'marcas_lista';
    let data = await cacheGet(cacheKey);

    if (!data) {
      data = await prisma.marca.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          logo: true,
        },
      });
      await cacheSet(cacheKey, data, 3600);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error en getMarcas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas',
    });
  }
});

module.exports = router;