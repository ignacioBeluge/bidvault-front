import client from './client';

// GET /auctions — devuelve array directo de SubastaResumenDTO
export async function getSubastas() {
  const response = await client.get('/auctions');
  return response.data; // [ { id, fecha, hora, estado, categoria, ubicacion } ]
}

// GET /auctions/:id — devuelve SubastaDetalleDTO con items[]
export async function getSubasta(id) {
  const response = await client.get(`/auctions/${id}`);
  return response.data;
}

// GET /auctions/:subastaId/items/:itemId/constraints?categoria=oro
// Devuelve los límites del slider calculados por el servidor
export async function getConstraints(subastaId, itemId, categoria) {
  const response = await client.get(
    `/auctions/${subastaId}/items/${itemId}/constraints`,
    { params: { categoria } }
  );
  return response.data; // { pujaMinima, pujaMaxima, mejorOfertaActual, valorBase, aplicanLimites }
}
