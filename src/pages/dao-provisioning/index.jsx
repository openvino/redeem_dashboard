import React, { useEffect } from "react";
import Head from "next/head";
import Table from "@/components/Table";
import HomeLayout from "@/components/HomeLayout";
import { getSession, useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { scrollStyle } from "@/styles/table";
import useDaoProvisioning from "@/hooks/useDaoProvisioning";
import { loadDaoProvisioningRecords } from "@/utils/daoProvisioningUtils";
import { ROUTE_CONSTANTS } from "@/utils/tableUtils";
import { isCostafloresAdmin } from "@/utils/authUtils";
import { useRouter } from "next/router";

const DaoProvisioning = () => {
	const { t } = useTranslation();
	const session = useSession();
	const router = useRouter();
	const { rows, records, setRecords, loaded } = useDaoProvisioning();

	useEffect(() => {
		const styleElement = document.createElement("style");
		styleElement.innerHTML = scrollStyle;
		document.head.appendChild(styleElement);

		return () => {
			document.head.removeChild(styleElement);
		};
	}, []);

	useEffect(() => {
		if (!isCostafloresAdmin(session)) return;
		const currentRecords = loadDaoProvisioningRecords();
		setRecords(currentRecords);
	}, [session?.status, session?.data?.winery_id, setRecords]);

	useEffect(() => {
		if (!isCostafloresAdmin(session)) return;
		if (!loaded) return;
		if ((records ?? []).length === 0) {
			router.replace(`${ROUTE_CONSTANTS.DAO_PROVISIONING_ROUTE}/launch`);
		}
	}, [loaded, records, router, session]);

	return (
		<HomeLayout>
			<Head>
				<title>OpenVino DAO Provisioning</title>
			</Head>

			<div className="space-y-6">
				<div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
					<div className="w-16 h-16 relative">
						<img
							src="/assets/ovi-logo.png"
							alt="OVI logo"
							className="h-16 w-16 object-contain"
							onError={(e) => {
								e.currentTarget.onerror = null;
								e.currentTarget.src = "/assets/ovi-logo.svg";
							}}
						/>
					</div>
					<div>
						<h1 className="text-xl font-semibold">
							{t("dao_provisioning_title", {
								defaultValue: "OpenVino DAO provisioning",
							})}
						</h1>
						<p className="text-sm text-gray-600">
							{t("dao_provisioning_subtitle", {
								defaultValue:
									"Draft, save and launch the OVI governance token, its crowdsale and the DAO contracts.",
							})}
						</p>
					</div>
				</div>

				<div className="border rounded-lg overflow-x-scroll custom-scroll bg-white shadow-sm">
					<Table
						columns={rows}
						data={records}
						n={10}
						route={ROUTE_CONSTANTS.DAO_PROVISIONING_ROUTE}
					/>
				</div>
			</div>
		</HomeLayout>
	);
};

export default DaoProvisioning;

export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (!session) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const normalize = (value) =>
		(value === undefined || value === null ? "" : String(value)).toLowerCase();
	const allowedIds = new Set(
		[
			process.env.NEXT_PUBLIC_COSTAFLORES_WINERY_ID,
			process.env.COSTAFLORES_WINERY_ID,
			"costaflores",
			"1",
		]
			.filter(Boolean)
			.map((val) => normalize(val))
	);
	const userWineryId = normalize(session.winery_id);
	const isAuthorized =
		Boolean(session.is_admin) && userWineryId && allowedIds.has(userWineryId);

	if (!isAuthorized) {
		return {
			redirect: {
				destination: "/dashboard",
				permanent: false,
			},
		};
	}

	return { props: {} };
}
