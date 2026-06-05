import client from './client';

// Llama a POST /auth/login del backend Spring Boot.
export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data; // { token, usuarioId, nombre, categoria, etapaRegistro }
}

// POST /auth/register/stage1 — datos personales + domicilio + fotos DNI
export async function registerStage1(data) {
  const response = await client.post('/auth/register/stage1', data);
  return response.data;
}

// POST /auth/register/stage2 — medio de pago
export async function registerStage2(usuarioId, data) {
  const response = await client.post(`/auth/register/stage2?usuarioId=${usuarioId}`, data);
  return response.data;
}
