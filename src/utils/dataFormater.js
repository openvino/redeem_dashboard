export const dataFormater = (redeems) => {
  const data = [];
  redeems.map((item, index) => {
    data.push({
      amount: item.amount,
      country_id: item.country_id,
      created_at: item.created_at,
      customer_id: item.customer_id,
      deleted_at: item.deleted_at,
      email: item.email.trim(),
      id: item.id,
      name: item.name.trim(),
      number: item.number,
      province_id: item.province_id.trim(),
      street: item.street.trim(),
      telegram_id: item.telegram_id.trim(),
      updated_at: item.updated_at,
      winerie_id: item.winerie_id,
      year: item.year,
      zip: item.zip,
      status: "pending",
    });
  });
  return data;
};
