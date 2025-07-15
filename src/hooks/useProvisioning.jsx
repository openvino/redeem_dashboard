import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const useProvisioning = () => {
	const { t } = useTranslation();
	const [tokens, setTokens] = useState({});
	const session = useSession();
	const rows = [
		{
			title: t("action"),
			field: "acciones",
		},
		{
			title: t("token_symbol"),
			field: "symbol",
		},
		{
			title: t("nombre"),
			field: "name",
		},
		{
			title: t("cap"),
			field: "cap",
		},
		{
			title: t("token_address"),
			field: "token_address",
		},
		{
			title: t("image"),
			field: "tokenImage",
		},
		{
			title: t("opening_time"),
			field: "openingTime",
		},
		{
			title: t("closing_time"),
			field: "closingTime",
		},

		{
			title: t("tokens_transferred_to_crowdsale"),
			field: "tokensToCrowdsale",
		},
		{
			title: t("crowdsale_address"),
			field: "crowdsale_address",
		},
		{
			title: t("bodega"),
			field: "winery_id",
		},
	];
	return {
		rows,
		tokens,
		setTokens,
		session,
	};
};

export default useProvisioning;
