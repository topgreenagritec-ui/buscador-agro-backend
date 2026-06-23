// Redis simplificado - Sin Redis para evitar dependencias
// Esta versión usa caché en memoria

const cache = {};

async function cacheGet(key) {
  if (cache[key] && cache[key].expires > Date.now()) {
    return cache[key].value;
  }
  delete cache[key];
  return null;
}

async function cacheSet(key, value, ttl = 3600) {
  cache[key] = {
    value,
    expires: Date.now() + (ttl * 1000)
  };
}

async function cacheDelete(key) {
  delete cache[key];
}

async function cacheFlush() {
  Object.keys(cache).forEach(key => delete cache[key]);
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheFlush,
};