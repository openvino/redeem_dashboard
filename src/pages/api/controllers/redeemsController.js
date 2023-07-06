import conn from "../config/db";
export const getRedeems = async (token) => {
  let query = `SELECT redeem_infos.id,redeem_infos.city, redeem_infos.phone, redeem_infos.created_at, redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, redeem_infos.redeem_status, redeem_infos.watched, users.email, users.name `;
  query += `FROM redeem_infos `;
  query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  query += `WHERE redeem_infos.winerie_id = (SELECT id FROM wineries WHERE public_key = '${token}');`;
  const redeems = await conn.query(query);

  if (redeems.rows.length > 0) {
    return redeems.rows;
  } else {
    return [];
    throw new Error("No redeems");
  }
};

//TODO AGREGAR CAMPO STATUS
export const updateRedeemStatus = async (req) => {
  const {
    street,
    id,
    number,
    zip,
    customer_id,
    status,
    country_id,
    province_id,
    email,
    name,
    telegram_id,
  } = req;

  // console.log(req);

  // Actualizar la tabla redeem_infos
  let redeemQuery = `UPDATE redeem_infos SET `;
  let redeemUpdateFields = [];

  if (status) redeemUpdateFields.push(`redeem_status = '${status}'`);
  if (country_id) redeemUpdateFields.push(`country_id = '${country_id}'`);
  if (province_id) redeemUpdateFields.push(`province_id = '${province_id}'`);
  if (telegram_id) redeemUpdateFields.push(`telegram_id = '${telegram_id}'`);
  if (street) redeemUpdateFields.push(`street = '${street}'`);
  if (number) redeemUpdateFields.push(`number = '${number}'`);
  if (zip) redeemUpdateFields.push(`zip = '${zip}'`);

  redeemQuery += redeemUpdateFields.join(", ");
  redeemQuery += ` WHERE id = '${id}'`;

  await conn.query(redeemQuery);
  // Actualizar la tabla usuarios
  let userQuery = `UPDATE users SET `;
  let userUpdateFields = [];
  if (name) userUpdateFields.push(`name = '${name}'`);
  if (email) userUpdateFields.push(`email = '${email}'`);
  userQuery += userUpdateFields.join(", ");
  userQuery += ` WHERE public_key = '${customer_id}'`;

  const userUpdate = await conn.query(userQuery);
};

export const getAllRedeems = async () => {
  let query = `SELECT redeem_infos.id, redeem_infos.city, redeem_infos.phone, redeem_infos.created_at, redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, redeem_infos.redeem_status, redeem_infos.watched, users.email, users.name `;
  query += `FROM redeem_infos `;
  query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  const redeems = await conn.query(query);
  if (redeems.rows.length > 0) {
    return redeems.rows;
  } else {
    throw new Error("No redeems");
  }
};
