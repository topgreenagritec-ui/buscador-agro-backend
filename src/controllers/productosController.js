const { PrismaClient } = require('@prisma/client');
const { cacheGet, cacheSet } = require('../config/redis');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function getCategoriasCompletas(req, res) {
  try {
    const cacheKey = 'categorias_completas';
    let data = await cacheGet(cacheKey);

    if (!data) {
      data = await prisma.categoria.findMany({
        where: { activo: true },
        orderBy: { orden: 'asc' },
        include: {
          subcategorias: {
            where: { activo: true },
            orderBy: { orden: 'asc' },
            include: {
              items: {
                where: { activo: true },
                orderBy: { orden: 'asc' },
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      });
      await cacheSet(cacheKey, data, 3600);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error en getCategoriasCompletas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
    });
  }
}

async function getItemsBySubcategoria(req, res) {
  try {
    const { subcategoriaId } = req.params;
    
    const items = await prisma.item.findMany({
      where: {
        subcategoriaId: parseInt(subcategoriaId),
        activo: true,
      },
      orderBy: { orden: 'asc' },
      include: {
        marcas: {
          include: {
            marca: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    logger.error('Error en getItemsBySubcategoria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener items',
    });
  }
}

async function getMarcasByItem(req, res) {
  try {
    const { itemId } = req.params;
    
    const marcas = await prisma.marcaItem.findMany({
      where: { itemId: parseInt(itemId) },
      include: {
        marca: true,
      },
      orderBy: {
        marca: {
          nombre: 'asc',
        },
      },
    });

    res.json({
      success: true,
      data: marcas.map(m => m.marca),
    });
  } catch (error) {
    logger.error('Error en getMarcasByItem:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas',
    });
  }
}

async function buscarProductos(req, res) {
  try {
    const { categoriaId, subcategoriaId, itemId, marcaId, condicion, origen } = req.query;

    const filters = {};
    if (categoriaId) filters.categoriaId = parseInt(categoriaId);
    if (subcategoriaId) filters.subcategoriaId = parseInt(subcategoriaId);
    if (itemId) filters.itemId = parseInt(itemId);
    if (marcaId) filters.marcaId = parseInt(marcaId);
    if (condicion) filters.condicion = condicion;
    if (origen) filters.origen = origen;

    const cacheKey = `busqueda_${JSON.stringify(filters)}`;
    let result = await cacheGet(cacheKey);

    if (!result) {
      result = {
        filters,
        timestamp: new Date().toISOString(),
        message: 'Búsqueda exitosa - Conecta tu base de datos',
      };
      await cacheSet(cacheKey, result, 300);
    }

    if (req.usuario) {
      await prisma.busqueda.create({
        data: {
          usuarioId: req.usuario.id,
          categoriaId: categoriaId ? parseInt(categoriaId) : null,
          subcategoriaId: subcategoriaId ? parseInt(subcategoriaId) : null,
          itemId: itemId ? parseInt(itemId) : null,
          marcaId: marcaId ? parseInt(marcaId) : null,
          condicion,
          origen,
          resultado: result,
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error en buscarProductos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
    });
  }
}

module.exports = {
  getCategoriasCompletas,
  getItemsBySubcategoria,
  getMarcasByItem,
  buscarProductos,
};