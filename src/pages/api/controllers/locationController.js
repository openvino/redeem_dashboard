import conn from "../config/db";
export const getLocation = async (token, country_id, province_id) => {
  let query = `SELECT * FROM shipping_costs_clone `;
  query += `WHERE shipping_costs_clone.province_id = ${province_id} `;
  query += `AND shipping_costs_clone.country_id = ${country_id};`;
  const location = await conn.query(query);

  if (location.rows.length > 0) {
    return location.rows[0];
  } else {
    throw new Error("No such country or province");
  }
};

// import conn from "../config/db";
// export const getLocation = async (token,country_id, province_id) => {
//   let query = `SELECT * from shipping_costs_clone WHERE shipping_costs_clone.province_id = province_id`;
//   query += `FROM shipping_costs_clone `;
//   query += `JOIN users ON users.public_key = redeem_infos.customer_id `;
//   query += `JOIN wineries ON wineries.public_key = '${token}';`;
//   const location = await conn.query(query);

//   if (location.country && location.province) {
//     return location;
//   } else {
//     throw new Error("No such coutry or province");
//   }
// };
