const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']
});

// Función para conectar a la base de datos
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL conectado exitosamente');
    return prisma;
  } catch (error) {
    logger.error('❌ Error conectando a PostgreSQL:', error);
    throw error;
  }
}

// Función para desconectar
async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('🛑 PostgreSQL desconectado');
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};