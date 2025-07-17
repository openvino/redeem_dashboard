import React, { useEffect, useState } from "react";
import Table from "@/components/Table";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { scrollStyle } from "@/styles/table";
import HomeLayout from "@/components/HomeLayout";
import {
	getAllLaunchingTokens,
	tokensLaunching,
	tokensLaunchingAll,
} from "@/utils/provisioningUtils";
import useProvisioning from "@/hooks/useProvisioning";
import { ROUTE_CONSTANTS } from "@/utils";
import { isAdminUser } from "@/utils/authUtils";
import LoadingSpinner from "@/components/Spinner";

const Provisioning = () => {
	const { rows, tokens, setTokens, session } = useProvisioning();

	const winery_id = session.data?.winery_id;
	let columnas = rows;

	useEffect(() => {
		const styleElement = document.createElement("style");
		styleElement.innerHTML = scrollStyle;
		document.head.appendChild(styleElement);

		return () => {
			document.head.removeChild(styleElement);
		};
	}, []);

	useEffect(() => {
		const tokensPromise = isAdminUser(session)
			? getAllLaunchingTokens()
			: tokensLaunching(winery_id);
		tokensPromise.then((tokensAll) => {
			setTokens(tokensAll);
			console.log(tokensAll);
		});
	}, []);

	return (
		<HomeLayout>
			<Head>
				<title>Wine Token Provisioning</title>
			</Head>
			{tokens?.length > 0 ? (
				<div className="border rounded-lg overflow-x-scroll custom-scroll">
					<Table
						columnas={columnas}
						data={tokens}
						n={10}
						route={ROUTE_CONSTANTS.PROVISIONING_ROUTE}
					/>
				</div>
			) : (
				<div className="flex items-center justify-center align-middle mt-20">
					<LoadingSpinner />
				</div>
			)}
		</HomeLayout>
	);
};

export default Provisioning;
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
	return {
		props: {},
	};
}
