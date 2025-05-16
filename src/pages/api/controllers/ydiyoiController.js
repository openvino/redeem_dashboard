import conn from "../config/db";

export const getYditoiUsers = async (address) => {
  try {
    let query = 'SELECT * FROM "user"';

    if (address) {
      query += ` WHERE walletaddress = '${address}'`;
    }

    const users = await conn.query(query);

    if (users.rows.length) return users.rows;
  } catch (error) {
    console.log(error);
  }
};

export const createYdiyoiUser = async (address) => {
  address && console.log("createYdiyoiUser", address);

  try {
    const query = `
      INSERT INTO "user" (
        firstname, lastname, telegramid, birthdate, email, 
        address_1, address_2, password, walletaddress, 
        roleid, statusid, resetkey
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      "-", // firstname
      "-", // lastname
      "-", // telegramid
      "1900-01-01", // birthdate
      "-", // email
      "-", // address_1
      "-", // address_2
      "-", // password
      address, // walletaddress
      1, // roleid
      3, // statusid
      null, // resetkey
    ];

    const result = await conn.query(query, values);

    if (result.rows.length) {
      return result.rows[0];
    } else {
      throw new Error("User creation failed");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
