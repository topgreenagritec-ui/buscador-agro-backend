const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // 1. Usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@agro.com' },
    update: {},
    create: {
      email: 'admin@agro.com',
      password: adminPassword,
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin creado');

  // 2. Categorías principales
  const categorias = [
    { nombre: 'MAQUINARIA AGRÍCOLA', orden: 1 },
    { nombre: 'RIEGO Y DRENAJE', orden: 2 },
    { nombre: 'INSUMOS AGRÍCOLAS', orden: 3 },
    { nombre: 'GANADERÍA Y FORRAJES', orden: 4 },
    { nombre: 'REPUESTOS Y MANTENIMIENTO', orden: 5 },
    { nombre: 'AGRICULTURA DE PRECISIÓN Y TECNOLOGÍA', orden: 6 },
    { nombre: 'TIERRAS Y PARCELAS', orden: 7 },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categorías creadas');

  // 3. Marcas
  const marcas = [
    'Agrinar', 'Antonio Carraro', 'Apache', 'Belarus', 'Bronco',
    'Case', 'Case IH', 'Chery', 'Chery Bylion', 'Claas',
    'Deutz', 'Deutz-Fahr', 'Dongfeng', 'Eisen', 'Farmtrac',
    'Ferrari', 'Fiat', 'Fiat Someca', 'Foton', 'Grosspal',
    'Hanomag', 'Husqvarna', 'Jhon Deere', 'Jinma', 'John Deere',
    'Kioti', 'Kubota', 'Lamborghini Trattori', 'Landini', 'Lovol',
    'Mahindra', 'Massey Ferguson', 'McCormick', 'New Holland',
    'Pasquali', 'Pauny', 'Roland H', 'SAME', 'Shibaura',
    'Someca', 'Sonalika', 'Universal', 'Valpadana', 'Valtra',
    'Yanmar', 'Yard Machines', 'Zanello', 'Zoomlion'
  ];

  for (const nombre of marcas) {
    await prisma.marca.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('✅ Marcas creadas');

  // 4. Servicios
  const servicios = ['Asesoramiento', 'Contratistas', 'Logística', 'Acopio', 'Inversores'];
  for (const nombre of servicios) {
    await prisma.servicio.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('✅ Servicios creados');

  console.log('✅ Seeding completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });