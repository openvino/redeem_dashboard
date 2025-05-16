import { useTranslation } from "react-i18next";

export const dataFormater = (winarys) => {
  const { t } = useTranslation();
  const data = [];

  winarys.map((item, index) => {
    data.push({
      id: item.id,
      created_at: item.created_at,
      amount: item.amount,
      country_id: item.country_id,
      deleted_at: item.deleted_at,
      name: item.name,
      email: item.email,
      website: item.website,
      image: item.image,
      primary_color: item.primary_color,
      secret: item.secret,
      public_key: item.public_key,
      ens: item.ens,
      isAdmin: item.isAdmin ? t("SI") : t("NO"),

    });
  });
  return data;
};
