import conn from "../config/db";

export const getAllWinarys = async (token) => {
  let query = `SELECT * from wineries `;
  //   query += `FROM redeem_infos `;
  //   query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
  //   query += `WHERE redeem_infos.winerie_id = (SELECT id FROM wineries WHERE public_key = '${token}');`;
  const winarys = await conn.query(query);

  if (winarys.rows.length > 0) {
    return winarys.rows;
  } else {
    throw new Error("No winarys");
  }
};

//TODO AGREGAR CAMPO STATUS
export const updateWinary = async (req) => {
  const {
    id,
    name,
    website,
    image,
    primary_color,
    secret,
    public_key,
    isAdmin,
  } = req;

  // console.log(req);

  // Actualizar la tabla winarys
  let winaryQuery = `UPDATE redeem_infos SET `;
  let winaryUpdateFields = [];

  if (name) winaryUpdateFields.push(`name = '${name}'`);
  if (website) winaryUpdateFields.push(`website = '${website}'`);
  if (image) winaryUpdateFields.push(`image = '${image}'`);
  if (primary_color)
    winaryUpdateFields.push(`primary_color = '${primary_color}'`);
  if (public_key) winaryUpdateFields.push(`public_key = '${public_key}'`);
  if (isAdmin) winaryUpdateFields.push(`isAdmin = '${isAdmin}'`);

  winaryQuery += winaryUpdateFields.join(", ");
  winaryQuery += ` WHERE id = '${id}'`;

  await conn.query(winaryQuery);
  // Actualizar la tabla redeem_infos
  //   let redeemsQuery = `UPDATE redeem_infos SET `;
  //   let userRedeemFields = [];
  //   if (name) userUpdateFields.push(`name = '${name}'`);
  //   if (email) userUpdateFields.push(`email = '${email}'`);
  //   userQuery += userUpdateFields.join(", ");
  //   userQuery += ` WHERE public_key = '${customer_id}'`;

  //   const userUpdate = await conn.query(userQuery);
};

// export const getAllRedeems = async () => {
//   let query = `SELECT redeem_infos.id, redeem_infos.created_at, redeem_infos.updated_at, redeem_infos.deleted_at, redeem_infos.customer_id, redeem_infos.year, redeem_infos.street, redeem_infos.number, redeem_infos.country_id, redeem_infos.province_id, redeem_infos.zip, redeem_infos.telegram_id, redeem_infos.amount, redeem_infos.winerie_id, redeem_infos.redeem_status, redeem_infos.watched, users.email, users.name `;
//   query += `FROM redeem_infos `;
//   query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
//   const redeems = await conn.query(query);

//   if (redeems.rows.length > 0) {
//     return redeems.rows;
//   } else {
//     throw new Error("No redeems");
//   }
// };
