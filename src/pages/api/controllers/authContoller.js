import conn from '../config/db';

export async function checkAuth(public_key) {
  const wineryAdmin = await conn.query(
    `SELECT * FROM admin_users WHERE id='${public_key}';`
  );

  if (wineryAdmin.rows.length) {
    return true;
  } else {
    return false;
  }
}

export async function getProfile(public_key) {
  const wineryAdmin = await conn.query(
    `SELECT * FROM admin_users WHERE ID='${public_key}';`
  );

  if (wineryAdmin.rows.length) {
    return wineryAdmin.rows[0];
  } else {
    throw new Error('Invalid credentials');
  }
}

export async function isAdmin(public_key) {
  const adminUsers = await conn.query(
    `SELECT * FROM admin_users WHERE ID='${public_key}';`
  );

  if (adminUsers.rows.length) {
    if (adminUsers.rows[0].is_admin === true) {
      return true;
    } else {
      return false;
    }
  } else {
    throw new Error('Hubo un error');
  }
}
