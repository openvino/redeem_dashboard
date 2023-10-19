import conn from "../config/db";

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

  let adminQuery = `UPDATE admin_users SET `;
  let adminUpdateFields = [];

  if (id) adminUpdateFields.push(`id = '${id}'`);
  if (name) adminUpdateFields.push(`name = '${name}'`);
  if (last_name) adminUpdateFields.push(`last_name = '${last_name}'`);
  if (email) adminUpdateFields.push(`email = '${email}'`);
  if (winery_id) adminUpdateFields.push(`winery_id = '${winery_id}'`);
  if (profile_img) adminUpdateFields.push(`profile_img = '${profile_img}'`);
  if (is_admin) adminUpdateFields.push(`is_admin = '${is_admin}'`);

  adminQuery += adminUpdateFields.join(", ");
  adminQuery += ` WHERE id = '${id}'`;
  await conn.query(adminQuery);
};

export const createAdmin = async (req) => {
  const { id, name, last_name, email, winery_id, profile_img, is_admin } =
    req.body.data;

  let query = `INSERT INTO admin_users (id, name, last_name, email, winery_id, profile_img, is_admin) `;

  // pkOrENS = await isENS(req.public_key);

  query += `VALUES ('${id.toLowerCase()}', '${name}', '${last_name}', '${email}', '${winery_id}', '${profile_img}', '${is_admin}')`;

  const adminCreated = await conn.query(query);
};
