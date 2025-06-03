import conn from "../config/db";

export async function getTokens(winery_id) {
  const query = `
        SELECT * FROM token_wineries WHERE winerie_id = $1;`;

  const { rows } = await conn.query(query, [winery_id]);

  if (rows.length === 0) {
    throw new Error("token not found");
  }
  const tokens = rows;

  return tokens;
}

export async function getTokenShippingInfo(tokenId) {
  const query = `SELECT * FROM token_shipping_cost WHERE token_id = $1;`;

  const { rows } = await conn.query(query, [tokenId.toLowerCase()]);

  if (rows.length === 0) {
    return [];
  }
  const tokens = rows;

  return tokens;
}

export async function getTokenShippingInfoById(shippingId) {
  const query = `SELECT * FROM token_shipping_cost WHERE id = $1;`;

  const { rows } = await conn.query(query, [shippingId.toLowerCase()]);

  if (rows.length === 0) {
    throw new Error("token not found");
  }
  const tokens = rows;

  return tokens;
}
export async function updateShipping(body) {
  const { id, base_cost, cost_per_unit, active } = body;

  const toFloatOrNull = (val) => (val === "" ? null : parseFloat(val));

  const query = `
    UPDATE token_shipping_cost
    SET base_cost = $1, cost_per_unit = $2, active = $3
    WHERE id = $4;
  `;

  await conn.query(query, [
    toFloatOrNull(base_cost),
    toFloatOrNull(cost_per_unit),
    active,
    id,
  ]);

  return true;
}
