import { useSession, getSession } from "next-auth/react";
import { useEffect } from "react";
import Table from "../components/Table";
import { dataFormater } from "../utils/dataFormater.js";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head.js";
import { getRedeems } from "@/redux/actions/winaryActions";
import { useTranslation } from "react-i18next";
import { getCountries, getProvinces } from "../redux/actions/winaryActions";
import HomeLayout from "@/components/HomeLayout";
import { buildColumns, countryAndProvinceNames, filterData } from "@/utils";
let flag = true;

const Dashboard = () => {
	const session = useSession();
	const { t } = useTranslation();
	const filters = useSelector((state) => state.filter);
	const countries = useSelector((state) => state.winaryAdress.countries);
	const provinces = useSelector((state) => state.winaryAdress.provinces);
	const columns = buildColumns(t);

	useEffect(() => {
		if (session.status === "authenticated" && flag) {
			dispatch(getRedeems(session.data.is_admin));
			dispatch(getCountries());
			dispatch(getProvinces());
			flag = false;
		}
	}, [session]);

	const dispatch = useDispatch();

	const redeems = useSelector((state) => state.winaryAdress.redeems);

	const data = filterData(
		countryAndProvinceNames(dataFormater(redeems, []), countries, provinces),
		filters
	);

	return (
		<HomeLayout>
			<Head>
				<title>OpenVino - Dashboard</title>
			</Head>
			<div>
				<h1 className=" text-xl font-bold m-2">Redeems</h1>
				<div className=" overflow-x-scroll custom-scroll">
					<Table
						data={data}
						columns={columns}
						n={50}
						copyExcludedFields={["shipping_paid_status", "pickup"]}
					/>
				</div>
			</div>
		</HomeLayout>
	);
};

export default Dashboard;

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
