import conn from "../config/db";
import { v4 as uuid } from "uuid";
const resolveENS = require("../../../utils/resolveENS");
let pkOrENS, ens; // ENS or not

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
  const { email, id, name, website, image, primary_color, secret, public_key } =
    req;

  // Actualizar la tabla winarys
  let winaryQuery = `UPDATE wineries SET `;
  let winaryUpdateFields = [];

  if (name) winaryUpdateFields.push(`name = '${name}'`);
  if (website) winaryUpdateFields.push(`website = '${website}'`);
  if (image) winaryUpdateFields.push(`image = '${image}'`);
  if (email) winaryUpdateFields.push(`email = '${email}'`);

  if (primary_color)
    winaryUpdateFields.push(`primary_color = '${primary_color}'`);
  if (public_key) {
    pkOrENS = await isENS(public_key);
    ens = (pkOrENS == public_key) ? null : public_key;
    winaryUpdateFields.push(`public_key = '${pkOrENS}'`);
    winaryUpdateFields.push(`ens = '${ens}'`);
  };
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

  let query = `INSERT INTO wineries (id, name, website, image, email, primary_color, secret) `;

  //let query = `INSERT INTO wineries (id, name, website, image, email, primary_color, secret, public_key, "isAdmin", ens) `;
  
  pkOrENS = await isENS(req.public_key); 

  ens = (pkOrENS == req.public_key) ? null : req.public_key;

  //console.log('ens >>>>', ens );

  query += `VALUES ('${req.name.toLowerCase()}', '${req.name}', '${
    req.website
  }', '${req.image}', '${req.email}', '${req.primary_color}', '${req.secret}', '${ens}')`; //, ${(pkOrENS == req.public_key) ? NULL : req.public_key}

  const createWinary = await conn.query(query);
};

async function isENS(input) {
  if (input.endsWith(".eth")) {
    // La cadena parece ser un ENS
    const resolvedAddress = await resolveENS(input);
    if (resolvedAddress) {
      return resolvedAddress;
    } else {
      // Maneja el caso en el que no se pudo resolver el ENS
      //console.log('No se pudo resolver el ENS:', input);
      throw new Error("No se puede resolver el ENS " + input);
    }
  } else {
    return input;
  }
}
