version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: buscador_postgres
    restart: always
    environment:
      POSTGRES_USER: usuario
      POSTGRES_PASSWORD: contraseña_segura
      POSTGRES_DB: buscador_agro
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - buscador_network

  redis:
    image: redis:7-alpine
    container_name: buscador_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - buscador_network

  backend:
    build: .
    container_name: buscador_backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://usuario:contraseña_segura@postgres:5432/buscador_agro?schema=public
      REDIS_URL: redis://redis:6379
      JWT_SECRET: mi_clave_secreta_cambiar_en_produccion
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    networks:
      - buscador_network

networks:
  buscador_network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
