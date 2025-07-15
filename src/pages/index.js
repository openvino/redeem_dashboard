import { ABeeZee } from "next/font/google";
import { useSelector } from "react-redux";
import Image from "next/image";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import React, { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import useLoginButton from "../components/useLoginButton";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/config/thirdwebClient";

const aBeeZee = ABeeZee({ subsets: ["latin"], weight: "400" });
export default function Home() {
	const router = useRouter();

	const alert = useSelector((state) => state.alert.alert);

	// const { LoginButton, error } = useLoginButton();

	return (
		<>
			<Head>
				<title>OpenVino - Iniciar Sesion</title>
			</Head>
			<main
				style={{ backgroundImage: `url(/assets/background-login.png)` }}
				className={`flex min-h-screen flex-col gap-10 justify-center items-center p-24 ${aBeeZee.className} bg-cover`}
			>
				{alert && alert}

				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>

				{router.asPath.includes("error") && <p>Hubo un error</p>}
				<div className="">
					<Image
						src={"/assets/website-logo.png"}
						width={200}
						height={200}
						alt="logo"
						priority
					/>
				</div>

				{/* <LoginButton /> */}
				<ConnectButton
					client={client}
					locale="es_ES"
					connectModal={{
						size: "compact",
						title: "Viniswap",
						welcomeScreen: {
							title: "eskere",
							img: "/mtb.png",
						},
					}}
					connectButton={{
						label: "Ingresar con Wallet",
						style: {
							padding: "12px 24px",
							background: "#000",
							color: "#fff",
							fontSize: "16px",
							fontWeight: "bold",
							borderRadius: "12px",
							boxShadow:
								"0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
						},
					}}
				/>
			</main>
		</>
	);
}
export async function getServerSideProps(context) {
	const session = await getSession(context);

	if (session) {
		return {
			redirect: {
				destination: "/dashboard",
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
}
