import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isCostafloresAdmin } from "@/utils/authUtils";
import { loadDaoProvisioningRecords } from "@/utils/daoProvisioningUtils";

const useDaoProvisioning = () => {
	const { t } = useTranslation();
	const session = useSession();
	const [records, setRecords] = useState([]);
	const [loaded, setLoaded] = useState(false);

	const rows = [
		{ title: t("action"), field: "actions" },
		{ title: t("token_symbol"), field: "symbol" },
		{ title: t("nombre"), field: "name" },
		{ title: t("address"), field: "token_address" },
		{ title: t("recipient"), field: "recipient" },
		{ title: t("default_admin"), field: "default_admin" },
		{ title: t("rebaser"), field: "rebaser" },
		{ title: t("split_oracle"), field: "split_oracle" },
		{ title: t("governor"), field: "governor" },
		{ title: t("timelock"), field: "timelock" },
		{ title: t("wovi_address"), field: "wovi_address" },
		{ title: t("initial_mint_amount"), field: "initial_mint_amount" },
	];

	useEffect(() => {
		if (!isCostafloresAdmin(session)) return;
		const fetchRecords = async () => {
			const currentRecords = await loadDaoProvisioningRecords();
			setRecords(currentRecords);
			setLoaded(true);
		};

		fetchRecords();
	}, [session?.data?.winery_id, session?.status]);

	return {
		rows,
		records,
		setRecords,
		loaded,
		session,
	};
};

export default useDaoProvisioning;
