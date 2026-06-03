import client from './client';

// GET /auctions — trae las subastas que el usuario puede ver
export async function listarSubastas() {
  const response = await client.get('/auctions');
  return response.data;
}

// GET /auctions/{id} — detalle de una subasta
export async function obtenerSubasta(id) {
  const response = await client.get(`/auctions/${id}`);
  return response.data;
}

// GET límites del slider (calculados por el servidor)
export async function obtenerLimites(subastaId, itemId) {
  const response = await client.get(
    `/auctions/${subastaId}/items/${itemId}/constraints`
  );
  return response.data;
}

// POST realizar una puja
export async function realizarPuja(subastaId, itemId, monto, medioPagoId) {
  const response = await client.post(
    `/auctions/${subastaId}/items/${itemId}/bids`,
    { monto, medioPagoId }
  );
  return response.data;
}

