import conn from "../config/db";
import { v4 as uuid } from "uuid";

export const getAllWinarys = async (token) => {
  let query = `SELECT * from wineries`;
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
    email,
    id,
    name,
    website,
    image,
    primary_color,
    secret,
    public_key,
    isAdmin,
  } = req;



  // Actualizar la tabla winarys
  let winaryQuery = `UPDATE wineries SET `;
  let winaryUpdateFields = [];

  if (name) winaryUpdateFields.push(`name = '${name}'`);
  if (website) winaryUpdateFields.push(`website = '${website}'`);
  if (image) winaryUpdateFields.push(`image = '${image}'`);
  if (email) winaryUpdateFields.push(`email = '${email}'`);

  if (primary_color)
    winaryUpdateFields.push(`primary_color = '${primary_color}'`);
  if (public_key) winaryUpdateFields.push(`public_key = '${public_key}'`);
  if (isAdmin == "true") winaryUpdateFields.push(`"isAdmin" = true`);
  else if (isAdmin === "false") {
    winaryUpdateFields.push(`"isAdmin" = false`);
  }

  winaryQuery += winaryUpdateFields.join(", ");
  winaryQuery += ` WHERE id = '${id}'`;

  const response = await conn.query(winaryQuery);
  // Actualizar l a tabla redeem_infos
  //   let redeemsQuery = `UPDATE redeem_infos SET `;
  //   let userRedeemFields = [];
  //   if (name) userUpdateFields.push(`name = '${name}'`);
  //   if (email) userUpdateFields.push(`email = '${email}'`);
  //   userQuery += userUpdateFields.join(", ");
  //   userQuery += ` WHERE public_key = '${customer_id}'`;

  //   const userUpdate = await conn.query(userQuery);
};

export const createWinary = async (req) => {
  const id = uuid();


  let query = `INSERT INTO wineries (id, name, website, image, email, primary_color, secret, public_key, "isAdmin") `;
  query += `VALUES ('${id}', '${req.name}', '${req.website}', '${req.image}', '${req.email}', '${req.primary_color}', '${req.secret}', '${req.public_key}', '${req.isAdmin}')`;

  const createWinary = await conn.query(query);
};
