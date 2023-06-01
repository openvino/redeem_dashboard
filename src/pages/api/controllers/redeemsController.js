import conn from "../config/db";

export const getRedeems = async () => {
  const query =
    "SELECT * FROM redeem_infos JOIN users ON users.public_key = redeem_infos.customer_id;";
  const redeems = await conn.query(query);
  if (redeems) {
    return redeems.rows;
  } else {
    throw new Error("No redeems");
  }
};
