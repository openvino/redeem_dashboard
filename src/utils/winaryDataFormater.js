export const dataFormater = (winarys) => {
  const data = [];

  winarys.map((item, index) => {
    data.push({
      id: item.id,
      created_at: item.created_at,
      amount: item.amount,
      country_id: item.country_id,
      deleted_at: item.deleted_at,
      name: item.name.trim(),
      // email: item.email.trim(),
      website: item.website,
      image: item.image,
      primary_color: item.primary_color,
      secret: item.secret,
      public_key: item.public_key,
      isAdmin: item.isAdmin,
    });
  });
  return data;
};
