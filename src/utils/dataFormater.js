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
      status: item.redeem_status,
      city: item.city,
      phone: item.phone
    });
  });
  return data;
};
