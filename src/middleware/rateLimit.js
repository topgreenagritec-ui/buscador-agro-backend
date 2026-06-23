const rateLimit = require('express-rate-limit');

// Límite para búsquedas
const busquedaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 búsquedas por minuto
  message: {
    error: true,
    message: 'Demasiadas búsquedas, espera un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: true,
    message: 'Demasiados intentos de login, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  busquedaLimiter,
  authLimiter,
};