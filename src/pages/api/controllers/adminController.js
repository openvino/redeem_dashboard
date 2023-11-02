import conn from '../config/db';
const resolveENS = require('../../../utils/resolveENS');
let pkOrENS, ens; // ENS or not

export const getAllAdmins = async () => {
  let query = `SELECT * FROM admin_users`;

  const admins = await conn.query(query);
  if (admins.rows.length > 0) {
    return admins.rows;
  } else {
    return [];
  }
};

export const getAdmin = async (id) => {
  let query = `SELECT * FROM admin_users WHERE id = '${id}'`;

  const admin = await conn.query(query);

  if (admin.rows.length > 0) {
    return admin.rows[0];
  } else {
    return [];
  }
};

export const getAdminsForWinery = async (winery_id) => {
  let query = `SELECT * FROM admin_users WHERE winery_id = '${winery_id}'`;
  const admins = await conn.query(query);

  if (admins.rows.length > 0) {
    return admins.rows;
  } else {
    return [];
  }
};

export const updateAdmin = async (req) => {
  const { id, name, last_name, email, winery_id, profile_img, is_admin } =
    req.body.data;

  const { previd } = req.body;
  let adminQuery = `UPDATE admin_users SET `;
  let adminUpdateFields = [];

  if (id) {
    console.log('cambio el id: ', id);

    pkOrENS = await isENS(id);

    console.log('pk or ENS: ', pkOrENS);

    ens = pkOrENS == id ? null : id;

    console.log('ens: ', ens);

    adminUpdateFields.push(`ens = '${ens}'`);
    adminUpdateFields.push(`id = '${pkOrENS.toLowerCase()}'`);
  }

  if (name) adminUpdateFields.push(`name = '${name}'`);
  if (last_name) adminUpdateFields.push(`last_name = '${last_name}'`);
  if (email) adminUpdateFields.push(`email = '${email}'`);
  if (winery_id) adminUpdateFields.push(`winery_id = '${winery_id}'`);
  if (profile_img) adminUpdateFields.push(`profile_img = '${profile_img}'`);
  if (is_admin) adminUpdateFields.push(`is_admin = '${is_admin}'`);

  adminQuery += adminUpdateFields.join(', ');
  adminQuery += ` WHERE id = '${previd}'`;
  console.log(id);
  await conn.query(adminQuery);
};

export const createAdmin = async (req) => {
  const { id, name, last_name, email, winery_id, profile_img, is_admin } =
    req.body.data;

  let query = `INSERT INTO admin_users (id, name, last_name, email, winery_id, profile_img, is_admin, ens) `;

  pkOrENS = await isENS(id);

  ens = pkOrENS == id ? null : id;

  //console.log('ens >>>>', ens );

  // pkOrENS = await isENS(req.public_key);

  query += `VALUES ('${pkOrENS.toLowerCase()}', '${name}', '${last_name}', '${email}', '${winery_id}', '${profile_img}', '${is_admin}', '${ens}')`;

  const adminCreated = await conn.query(query);
};
const ensRegex =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

async function isENS(input) {
  if (ensRegex.test(input)) {
    console.log('La cadena parece ser un ENS');
    const resolvedAddress = await resolveENS(input);

    if (resolvedAddress) {
      return resolvedAddress;
    } else {
      // Maneja el caso en el que no se pudo resolver el ENS
      console.log('No se pudo resolver el ENS:', input);
      throw new Error('No se puede resolver el ENS ' + input);
    }
  } else {
    return input;
  }
  console.log('/////////////////////////////', ensRegex.test(input));
}
