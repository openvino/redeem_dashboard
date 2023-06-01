import conn from "../config/db";
export const getRedeems = async (token) => {
  let query = `SELECT redeem_infos.id, redeem_infos.created_at,redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, users.email, users.name `;
  query += `FROM redeem_infos `;
  query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  query += `JOIN wineries ON wineries.public_key = '${token}';`;
  const redeems = await conn.query(query);

  if (redeems.rows.length > 0) {
    return redeems.rows;
  } else {
    throw new Error("No redeems");
  }
};

//TODO AGREGAR CAMPO STATUS
export const updateRedeemStatus = async (redeemId, status) => {
  let query = `UPDATE redeem_infos SET status = '${status}' `;
  query += `WHERE id = '${redeemId}'`;

  const update = await conn.query(query);

  if (update.rows.length > 0) {
    return update.rows;
  } else {
    throw new Error("No update");
  }
};
