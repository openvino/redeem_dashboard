export const buildColumnas = (t) => {
	return [
		{ title: "", field: "acciones" },
		{ title: t("creado"), field: "created_at" },
		{ title: t("año"), field: "year" },
		{ title: t("nombre"), field: "name" },
		{ title: t("monto"), field: "amount" },
		{ title: t("shipping_paid_status"), field: "shipping_paid_status" },
		{ title: t("pickup"), field: "pickup" },
		{ title: t("estado"), field: "status" },
		{ title: t("pais"), field: "country_id" },
		{ title: t("provincia"), field: "province_id" },
		{ title: t("ciudad"), field: "city" },
		{ title: "Email", field: "email" },
		{ title: t("cp"), field: "zip" },
	];
};

export const countryName = (country_id, countries) => {
	const country = countries?.find((e) => e.country_id === country_id);

	return country ? country.place_description : country_id;
};

export const provinceName = (province_id, provinces) => {
	const province = provinces?.find((e) => e.province_id === province_id);
	return province ? province.place_description : province_id;
};

export const countryAndProvinceNames = (data, countries, provinces) => {
	const newData = data.map((item) => ({
		...item,
		country_id: countryName(item.country_id),
		province_id: provinceName(item.province_id),
	}));

	return newData;
};
