import conn from "../config/db";

export const getRedeems = async (token) => {
  let getUserAdmin = `SELECT * FROM admin_users WHERE id = '${token}'`;

  const userAdmin = await conn.query(getUserAdmin);
  const wineryId = userAdmin.rows[0].winery_id;

  let query = `SELECT redeem_infos.id,redeem_infos.city, redeem_infos.phone, redeem_infos.created_at, redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, redeem_infos.status, redeem_infos.watched, redeem_infos.shipping_paid_status, redeem_infos.pickup, users.email, users.name `;
  query += `FROM redeem_infos `;
  query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  query += `WHERE redeem_infos.winerie_id = (SELECT id FROM wineries WHERE ID = '${wineryId}');`;

  const redeems = await conn.query(query);
  console.log(
    "REDEEMS                                                                  :",
    redeems
  );
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
    phone,
    city,
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
    shipping_paid_status,
    pickup,
  } = req;

  let redeemQuery = `UPDATE redeem_infos SET `;
  let redeemUpdateFields = [];

  if (phone) redeemUpdateFields.push(`phone = '${phone}'`);
  if (city) redeemUpdateFields.push(`city = '${city}'`);
  if (status) redeemUpdateFields.push(`status = '${status}'`);
  if (country_id) redeemUpdateFields.push(`country_id = '${country_id}'`);
  if (province_id) redeemUpdateFields.push(`province_id = '${province_id}'`);
  if (telegram_id) redeemUpdateFields.push(`telegram_id = '${telegram_id}'`);
  if (street) redeemUpdateFields.push(`street = '${street}'`);
  if (number) redeemUpdateFields.push(`number = '${number}'`);
  if (zip) redeemUpdateFields.push(`zip = '${zip}'`);
  if (shipping_paid_status)
    redeemUpdateFields.push(`zip = '${shipping_paid_status}'`);
  if (pickup) redeemUpdateFields.push(`zip = '${pickup}'`);

  redeemQuery += redeemUpdateFields.join(", ");
  redeemQuery += ` WHERE id = '${id}'`;

  await conn.query(redeemQuery);

  let userQuery = `UPDATE users SET `;
  let userUpdateFields = [];
  if (name) userUpdateFields.push(`name = '${name}'`);
  if (email) userUpdateFields.push(`email = '${email}'`);
  userQuery += userUpdateFields.join(", ");
  userQuery += ` WHERE public_key = '${customer_id}'`;

  const userUpdate = await conn.query(userQuery);
};

export const getAllRedeems = async () => {
  let query = `SELECT redeem_infos.id, redeem_infos.city, redeem_infos.phone, redeem_infos.created_at, redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, redeem_infos.status, redeem_infos.watched, redeem_infos.shipping_paid_status, redeem_infos.pickup, users.email, users.name `;
  query += `FROM redeem_infos `;
  query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  const redeems = await conn.query(query);
  if (redeems.rows.length > 0) {
    return redeems.rows;
  } else {
    throw new Error("No redeems");
  }
};
export const getAllLogs = async () => {
  console.log("getAllLogs");

  let query = `SELECT *`;
  // let query = `SELECT redeem_logs.id, redeem_logs.customer_id, redeem_logs.year, redeem_logs.street, redeem_logs.number, redeem_logs.country_id, redeem_logs.province_id, redeem_logs.zip, redeem_logs.telegram_id, redeem_logs.amount, redeem_logs.created_at, redeem_logs.updated_at, redeem_logs.winerie_id, redeem_logs.city, redeem_logs.phone, redeem_logs.signature, redeem_logs.burn_tx_hash, redeem_logs.shipping_tx_hash, redeem_logs.error_message, redeem_logs.shipping_paid_status, redeem_logs.pickup`;
  query += `FROM redeem_logs `;
  const log = await conn.query(query);
  console.log(log.rows);
  if (log.rows.length > 0) {
    return log.rows;
  } else {
    throw new Error("No logs");
  }
};
