import client from './client';

// POST /auctions/:subastaId/items/:itemId/bids
// El backend espera: { monto, medioPagoId }
export async function hacerPuja(subastaId, itemId, monto, medioPagoId = 1) {
  const response = await client.post(
    `/auctions/${subastaId}/items/${itemId}/bids`,
    { monto, medioPagoId }
  );
  return response.data;
}
