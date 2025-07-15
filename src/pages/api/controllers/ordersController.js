import conn from "../config/db";

export const getAllOrders = async () => {
  let getOrdersQuery = `SELECT * FROM sales`;

  getOrdersQuery += ` JOIN users ON users.public_key = sales.customer_id `;

  const orders = await conn.query(getOrdersQuery);

  if (orders.rows.length > 0) {
    return orders.rows;
  } else {
    return [];
  }
};

export const getOrders = async (wineryId) => {
  let getOrdersQuery = `
    SELECT * 
    FROM sales 
    JOIN users ON users.public_key = sales.customer_id 
    WHERE winerie_id = '${wineryId}';
  `;
  
  const orders = await conn.query(getOrdersQuery);

  if (orders.rows.length > 0) {
    return orders.rows;
  } else {
    return [];
  }
};


//TODO AGREGAR CAMPO STATUS
