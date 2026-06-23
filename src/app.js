require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const marcasRoutes = require('./routes/marcasRoutes');
const busquedaRoutes = require('./routes/busquedaRoutes');

const app = express();

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Demasiadas peticiones, por favor espera un momento.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// LOGGING
// ============================================

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// ============================================
// RUTAS
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/busqueda', busquedaRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
  });
});

// ============================================
// INICIALIZACIÓN
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;