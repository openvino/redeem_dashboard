import conn from "../config/db";

export async function getStockByCountry(token_id) {
  const { rows } = await conn.query(
    `SELECT DISTINCT ON (country_id) * FROM token_stock_by_country WHERE LOWER(token_id) = LOWER($1) ORDER BY country_id ASC`,
    [token_id]
  );
  return rows;
}

export async function upsertStockByCountry({ token_id, country_id, stock }) {
  const normalized = token_id.toLowerCase();
  const { rows } = await conn.query(
    `INSERT INTO token_stock_by_country (token_id, country_id, stock)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_id, country_id)
     DO UPDATE SET stock = EXCLUDED.stock
     RETURNING *`,
    [normalized, country_id, parseInt(stock, 10)]
  );
  return rows[0];
}
