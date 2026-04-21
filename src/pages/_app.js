import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import store from "../redux/store";
import { I18nextProvider } from "react-i18next";
import i18n from "../config/i18n";
import Router from "next/router";
import { useRouter } from "next/router";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import { ToastContainer, toast } from "react-toastify";
import { ThirdwebProvider } from "thirdweb/react";
import SessionSync from "@/components/Session";
import { chain, client } from "@/config/thirdwebClient";
import HomeLayout from "@/components/HomeLayout";

const DASHBOARD_LAYOUT_ROUTES = [
	"/dashboard",
	"/wineries",
	"/redeems",
	"/orders",
	"/tokens",
	"/detail/[c_id]",
	"/winaryDetail/[c_id]",
];

const DASHBOARD_LAYOUT_PREFIXES = [
	"/dao-provisioning",
	"/provisioning",
	"/shipping",
	"/admin",
];

const roboto = Montserrat({
	subsets: ["latin"],

	weight: ["400", "700"],
});
export default function App({ Component, pageProps }) {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const shouldUseDashboardLayout =
		DASHBOARD_LAYOUT_ROUTES.includes(router.pathname) ||
		DASHBOARD_LAYOUT_PREFIXES.some((prefix) =>
			router.pathname.startsWith(prefix)
		);

	useEffect(() => {
		const handleRouteChangeStart = () => {
			setLoading(true);
		};

		const handleRouteChangeComplete = () => {
			setLoading(false);
		};

		Router.events.on("routeChangeStart", handleRouteChangeStart);
		Router.events.on("routeChangeComplete", handleRouteChangeComplete);
		Router.events.on("routeChangeError", handleRouteChangeComplete);

		return () => {
			Router.events.off("routeChangeStart", handleRouteChangeStart);
			Router.events.off("routeChangeComplete", handleRouteChangeComplete);
			Router.events.off("routeChangeError", handleRouteChangeComplete);
		};
	}, []);

	return (
		<ThirdwebProvider client={client} activeChain={chain}>
			<I18nextProvider i18n={i18n}>
				<SessionProvider>
					<Provider store={store}>
						{loading && <Loader />}
						<main className={roboto.className}>
							<SessionSync />
							{shouldUseDashboardLayout ? (
								<HomeLayout>
									<Component {...pageProps} />
								</HomeLayout>
							) : (
								<Component {...pageProps} />
							)}
							<ToastContainer autoClose={2000} hideProgressBar={true} />
						</main>
					</Provider>
				</SessionProvider>
			</I18nextProvider>
		</ThirdwebProvider>
	);
}
