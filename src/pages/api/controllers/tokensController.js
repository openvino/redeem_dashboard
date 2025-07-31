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

export const tokensLaunching = async (wineryId) => {
  const query = `SELECT * FROM token_launch WHERE winery_id = $1;`;
  const { rows } = await conn.query(query, [wineryId]);

  return rows;
};
export const tokensLaunchingAll = async () => {
  const query = `SELECT * FROM token_launch;`;
  const { rows } = await conn.query(query);


  return rows;
};
export const tokenLaunching = async (id) => {

  const query = `SELECT * FROM token_launch WHERE id = $1;`;
  const { rows } = await conn.query(query, [id]);
  return rows[0];
};

export const updateLaunchingToken = async (id, fieldsToUpdate) => {

  if (!id) {
    throw new Error("ID is required to update record");
  }

  const columns = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate).map((v) => {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
      return v.replace("T", " ") + ":00";
    }
    return v;
  });

  if (columns.length === 0) {
    throw new Error("No fields provided for update");
  }

  const setClause = columns
    .map((col, index) => `"${col}" = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE token_launch
    SET ${setClause}
    WHERE id = $${columns.length + 1}
    RETURNING *;
  `;

  console.log("Generated Query:", query);

  try {
    const { rows } = await conn.query(query, [...values, id]);

    if (rows.length === 0) {
      throw new Error(`No record found with id ${id}`);
    }

    console.log(`Registro actualizado para id = ${id}:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error("Error al actualizar token_launch:", error);
    throw error;
  }
};

export const createLaunchingToken = async (body) => {
  const {
    id,
    name,
    symbol,
    cap,
    redeem_wallet_address,
    vintage,
    bottle_image,
    token_image,
    winery_id,
    description,
    wallet_address,
    price_per_token,
    rate,
    opening_time,
    closing_time,
    tokens_to_crowdsale,
    token_address,
    crowdsale_address,
  } = body;

  const query = `
  INSERT INTO token_launch (
    id,
    name,
    symbol,
    cap,
    redeem_wallet_address,
    vintage,
    bottle_image,
    token_image,
    winery_id,
    description,
    wallet_address,
    price_per_token,
    rate,
    opening_time,
    closing_time,
    tokens_to_crowdsale,
    token_address,
    crowdsale_address
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
  )
  RETURNING *;
`;

  const values = [
   id,
    name,
    symbol,
    cap,
    redeem_wallet_address,
    vintage,
    bottle_image,
    token_image,
    winery_id,
    description,
    wallet_address,
    price_per_token,
    rate,
    opening_time,
    closing_time,
    tokens_to_crowdsale,
    token_address,
    crowdsale_address
  ];

  try {
    const { rows } = await conn.query(query, values);

    console.log(`Registro creado para id = ${id}:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error("Error al crear token_launch:", error);
    throw error;
  }
};
