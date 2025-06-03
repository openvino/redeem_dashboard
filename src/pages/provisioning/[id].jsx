import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import axios from "axios";
import HomeLayout from "@/components/HomeLayout";
import useAdmins from "@/hooks/useAdmins";
import useWineries from "@/hooks/useWineries";
import useProfile from "@/hooks/useProfile";
import MTBArtifact from "../../../contracts/artifacts/MTB.json";
import CrowdsaleArtifact from "../../../contracts/artifacts/Crowdsale.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TOKEN_FLATTENED_SOURCE from "../../../contracts/flattened/mtb_flat.sol";
import CROWDSALE_FLATTENED_SOURCE from "../../../contracts/flattened/Crowdsale_flat.sol";

const Launch = () => {
	const router = useRouter();
	const account = useActiveAccount();
	const { id } = router.query;
	const { admins } = useAdmins(id);
	const { wineries } = useWineries();
	const { profile } = useProfile();
	const { register, handleSubmit, setValue, getValues } = useForm();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);

	// Fragmento del constructor para el token
	const tokenConstructorFragment = {
		type: "constructor",
		stateMutability: "nonpayable",
		inputs: [
			{ internalType: "string", name: "name", type: "string" },
			{ internalType: "string", name: "symbol", type: "string" },
			{ internalType: "uint256", name: "cap", type: "uint256" },
			{ internalType: "uint256", name: "initialMintAmount", type: "uint256" },
		],
	};
	// ABI completo del token, anteponiendo el fragmento del constructor
	const tokenAbi = [tokenConstructorFragment, ...MTBArtifact.abi];
	// Bytecode del token
	const tokenBytecode =
		MTBArtifact.data?.bytecode?.object ?? MTBArtifact.bytecode;

	// Fragmento del constructor para el crowdsale
	const crowdConstructorFragment = {
		type: "constructor",
		stateMutability: "nonpayable",
		inputs: [
			{ internalType: "address payable", name: "_wallet", type: "address" },
			{ internalType: "MTB", name: "_token", type: "address" },
			{ internalType: "uint256", name: "_cap", type: "uint256" },
			{ internalType: "uint256", name: "_openingTime", type: "uint256" },
			{ internalType: "uint256", name: "_closingTime", type: "uint256" },
			{ internalType: "uint256", name: "_rate", type: "uint256" },
		],
	};
	// ABI completo del crowdsale, anteponiendo el fragmento del constructor
	const crowdAbi = [crowdConstructorFragment, ...CrowdsaleArtifact.abi];
	// Bytecode del crowdsale
	const crowdBytecode =
		CrowdsaleArtifact.data?.bytecode?.object ?? CrowdsaleArtifact.bytecode;

	useEffect(() => {
		if (admins) {
			setValue("id", admins.id);
			setValue("name", admins.name);
			setValue("last_name", admins.last_name);
			setValue("winery_id", admins.winery_id);
			setValue("email", admins.email);
			setValue("profile_img", admins.profile_img);
			setValue("is_admin", admins.is_admin ? "true" : "false");
		}
	}, [admins, setValue]);

	const handleDeployAll = async () => {
		setLoading(true);
		const toastId = toast.loading("Iniciando despliegue…", {
			position: "top-right",
			theme: "dark",
		});

		try {
			if (!account) throw new Error("Conecta tu wallet primero");

			const v = getValues();
			// ─── TOKEN ────────────────────────────────────────────────────
			const name = v.name?.trim();
			const symbol = v.symbol?.trim();
			const capInput = String(v.cap || "").trim();
			if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
				throw new Error("Nombre, símbolo y cap del token son obligatorios");
			}
			const capBN = ethers.utils.parseEther(capInput);

			// ─── CROWDSALE ────────────────────────────────────────────────
			const walletAddress = v.walletAddress?.trim();
			if (!walletAddress)
				throw new Error("La dirección de wallet es obligatoria");
			if (!ethers.utils.isAddress(walletAddress)) {
				throw new Error("walletAddress no es una dirección válida");
			}

			const rate = Number(String(v.rate || "").trim());
			const openingTs = Math.floor(new Date(v.openingTime).getTime() / 1000);
			const closingTs = Math.floor(new Date(v.closingTime).getTime() / 1000);
			const tokensBN = ethers.utils.parseEther(
				String(v.tokensToCrowdsale || "").trim()
			);
			if (rate <= 0 || !v.openingTime || !v.closingTime || tokensBN.lte(0)) {
				throw new Error(
					"Completa correctamente todos los campos del crowdsale"
				);
			}
			if (openingTs >= closingTs)
				throw new Error("La apertura debe ser antes del cierre");
			if (tokensBN.gt(capBN))
				throw new Error("Los tokens para crowdsale exceden el cap");

			const weiCapBN = tokensBN.div(rate);
			if (weiCapBN.isZero())
				throw new Error("Rate demasiado alto para los tokens");

			// ─── PROVIDER & SIGNER ────────────────────────────────────────
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			// ─── STEP 1: Deploy Token ──────────────────────────────────────
			toast.update(toastId, {
				render: "Firmá para desplegar el Token…",
				isLoading: true,
			});
			const tokenFactory = new ethers.ContractFactory(
				tokenAbi,
				tokenBytecode,
				signer
			);
			const token = await tokenFactory.deploy(name, symbol, capBN, capBN);
			await token.deployed();
			console.log("📦 Token deployed at:", token.address);
			toast.update(toastId, {
				render: `✅ Token desplegado en: ${token.address}`,
				isLoading: false,
				type: "success",
			});

			// ─── STEP 1b: Verify Token inmediatamente ───────────────────────
			toast.update(toastId, {
				render: "Enviando verificación del Token…",
				isLoading: true,
				type: "info",
			});
			const tokenCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["string", "string", "uint256", "uint256"],
					[name, symbol, capBN, capBN]
				)
				.replace(/^0x/, "");

			const tokenVerifyResponse = await axios.post(
				"http://localhost:3006/verify-contract",
				{
					network: "baseSepolia",
					address: token.address,
					contractName: "contracts/mtb.sol:MTB", // ← Ajusta mayúsculas/minúsculas según tu ruta real
					sourceCode: TOKEN_FLATTENED_SOURCE,
					compilerVersion: "v0.8.22+commit.4fc1097e", // ← Cambia por la versión exacta que veas en https://basescan.org/solcversions
					codeformat: "solidity-single-file",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: tokenCtorEncoded,
				}
			);
			console.log("Token verify GUID:", tokenVerifyResponse.data.guid);

			let tokenVerified = false;
			const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
			while (!tokenVerified) {
				const checkStatus = await axios.get(
					"http://localhost:3006/checkverifystatus",
					{
						params: {
							network: "baseSepolia",
							guid: tokenVerifyResponse.data.guid,
						},
					}
				);

				if (checkStatus.data.status === "1") {
					tokenVerified = true;
					toast.update(toastId, {
						render: "✅ Token verificado correctamente en BaseScan",
						isLoading: false,
						type: "success",
					});
				} else if (
					checkStatus.data.status === "0" &&
					checkStatus.data.result.toLowerCase().includes("pending")
				) {
					await delay(5000); // Espera 5 segundos antes de volver a chequear
				} else {
					throw new Error(
						`Fallo la verificación del Token: ${checkStatus.data.result}`
					);
				}
			}

			toast.update(toastId, {
				render: "✅ Token verificado (GUID enviado)",
				isLoading: false,
				type: "success",
			});

			// ─── STEP 2: Deploy Crowdsale ───────────────────────────────────
			toast.update(toastId, {
				render: "Firmá para desplegar el Crowdsale…",
				isLoading: true,
				type: "info",
			});
			const crowdFactory = new ethers.ContractFactory(
				crowdAbi,
				crowdBytecode,
				signer
			);
			const crowdsale = await crowdFactory.deploy(
				walletAddress,
				token.address,
				weiCapBN,
				openingTs,
				closingTs,
				rate
			);
			await crowdsale.deployed();
			console.log("🎪 Crowdsale deployed at:", crowdsale.address);
			toast.update(toastId, {
				render: `✅ Crowdsale desplegado en: ${crowdsale.address}`,
				isLoading: false,
				type: "success",
			});

			// ─── STEP 2b: Verify Crowdsale inmediatamente ────────────────────
			toast.update(toastId, {
				render: "Enviando verificación del Crowdsale…",
				isLoading: true,
				type: "info",
			});
			const crowdCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["address", "address", "uint256", "uint256", "uint256", "uint256"],
					[walletAddress, token.address, weiCapBN, openingTs, closingTs, rate]
				)
				.replace(/^0x/, "");

			const crowdVerifyResponse = await axios.post(
				"http://localhost:3006/verify-contract",
				{
					network: "baseSepolia",
					address: crowdsale.address,
					contractName: "contracts/Crowdsale.sol:Crowdsale",
					sourceCode: CROWDSALE_FLATTENED_SOURCE,
					compilerVersion: "v0.8.22+commit.4fc1097e", // ← Igual aquí, la versión exacta
					codeformat: "solidity-single-file",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: crowdCtorEncoded,
				}
			);
			console.log("Crowdsale verify GUID:", crowdVerifyResponse.data.guid);
			toast.update(toastId, {
				render: "✅ Crowdsale verificado (GUID enviado)",
				isLoading: false,
				type: "success",
			});

			// ─── STEP 3: Fund Crowdsale ───────────────────────────────────────
			toast.update(toastId, {
				render: "Firmá para transferir tokens al Crowdsale…",
				isLoading: true,
				type: "info",
			});
			const txTransfer = await token.transfer(crowdsale.address, tokensBN);
			await txTransfer.wait();
			toast.update(toastId, {
				render: "✅ Tokens transferidos al Crowdsale",
				isLoading: false,
				type: "success",
			});

			toast.success("🔔 Despliegue y verificaciones completados");
		} catch (error) {
			console.error("DEPLOY & VERIFY ERROR", error);
			toast.update(toastId, {
				render: error.message || "Error durante despliegue/verificación",
				isLoading: false,
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<HomeLayout>
			<ToastContainer />
			<div className="p-4 w-full overflow-x-auto lg:overflow-x-hidden">
				<h1 className="text-2xl font-bold text-center mb-6">{t("launch")}</h1>
				<form
					className="space-y-6 bg-[#F1EDE2] p-6 rounded-xl border-2 border-gray-200"
					onSubmit={handleSubmit((e) => e.preventDefault())}
				>
					{/* Token Config */}
					<h2 className="text-xl font-semibold">{t("token_config")}</h2>
					<div className="grid lg:grid-cols-3 gap-4">
						<div>
							<label className="font-bold">{t("token_name")}</label>
							<input
								{...register("name")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("token_symbol")}</label>
							<input
								{...register("symbol")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("token_cap")}</label>
							<input
								type="number"
								step="any"
								{...register("cap")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
					</div>

					{/* Crowdsale Config */}
					<h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>
					<div className="grid lg:grid-cols-2 gap-4">
						<div>
							<label className="font-bold">{t("wallet_address")}</label>
							<input
								type="text"
								{...register("walletAddress")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">
								{t("rate")} ({t("tokens")}/ETH)
							</label>
							<input
								type="number"
								{...register("rate")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("opening_time")}</label>
							<input
								type="datetime-local"
								{...register("openingTime")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("closing_time")}</label>
							<input
								type="datetime-local"
								{...register("closingTime")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div className="lg:col-span-2">
							<label className="font-bold">{t("tokens_to_crowdsale")}</label>
							<input
								type="number"
								step="any"
								{...register("tokensToCrowdsale")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
					</div>

					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-2 bg-gray-300 rounded"
						>
							{t("volver")}
						</button>
						<button
							type="button"
							onClick={handleDeployAll}
							disabled={loading}
							className="px-6 py-2 bg-green-700 text-white rounded"
						>
							{t("deploy_and_verify")}
						</button>
					</div>
				</form>
			</div>
		</HomeLayout>
	);
};

export default Launch;
