const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function register(req, res) {
  try {
    const { email, password, nombre, apellido } = req.body;

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        rol: 'USUARIO',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: usuario,
    });
  } catch (error) {
    logger.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    delete usuario.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario,
        token,
      },
    });
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
}

async function getPerfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    logger.error('Error en getPerfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
    });
  }
}

module.exports = {
  register,
  login,
  getPerfil,
};