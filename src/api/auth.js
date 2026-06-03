import client from './client';

// Llama a POST /auth/login del backend Spring Boot.
export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data; // { token, usuarioId, nombre, categoria, etapaRegistro }
}