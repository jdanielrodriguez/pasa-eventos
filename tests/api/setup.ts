import dotenv from 'dotenv';
dotenv.config();

beforeAll(async () => {
  // Ejemplo: preparar DB, limpiar colecciones, etc.
  // await someDbClient.connect();
});

afterAll(async () => {
  // Ejemplo: cerrar conexiones globales
  // await someDbClient.close();
});

export {};
