export const dataFormater = (redeems) => {
  const data = [];
  redeems.map((item, index) => {
    data.push({
      amount: item.amount,
      country_id: item.country_id,
      created_at: item.created_at,
      customer_id: item.customer_id,
      deleted_at: item.deleted_at,
      email: item.email,
      id: item.id,
      name: item.name,
      number: item.number,
      province_id: item.province_id,
      street: item.street,
      telegram_id: item.telegram_id,
      updated_at: item.updated_at,
      winerie_id: item.winerie_id,
      year: item.year,
      zip: item.zip,
      status: item.status,
      city: item.city,
      phone: item.phone,
      shipping_paid_status: item.shipping_paid_status,
      pickup: item.pickup,
    });
  });
  return data;
};

export const logDataFormater = (logs) => {
  console.log(logs);
  const data = [];

  logs &&
    logs.map((item, index) => {
      data.push({
        id: item.id,
        customer_id: item.customer_id,
        year: item.year,
        street: item.street,
        number: item.number,
        country_id: item.country_id,
        province_id: item.province_id,
        zip: item.zip,
        telegram_id: item.telegram_id,
        amount: item.amount,
        created_at: item.created_at,
        winerie_id: item.winerie_id,
        city: item.city,
        phone: item.phone,
        signature: item.signature,
        burn_tx_hash: item.burn_tx_hash,
        shipping_paid_status: item.shipping_paid_status,
        shipping_tx_hash: item.shipping_tx_hash,
        pickup: item.pickup,
        error_message: item.error_message,
      });
    });
  console.log(data);
  return data;
};
