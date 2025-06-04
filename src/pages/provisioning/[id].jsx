import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import axios from "axios";
import HomeLayout from "@/components/HomeLayout";
import useAdmins from "@/hooks/useAdmins";
import MTBArtifact from "../../../contracts/artifacts/MTB.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { activeNetwork, openvinoApiKey, openvinoApiURL } from "@/config";

const Launch = () => {
	const router = useRouter();
	const account = useActiveAccount();
	const { id } = router.query;
	const { admins } = useAdmins(id);
	const { register, handleSubmit, setValue, getValues } = useForm();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [tokenAddress, setTokenAddress] = useState("");
	const [crowdsaleAddress, setCrowdsaleAddress] = useState("");
	const tokenAbi = MTBArtifact.output.contracts["contracts/MTB.sol"].MTB.abi;

	const tokenBytecode =
		MTBArtifact.output.contracts["contracts/MTB.sol"].MTB.evm.bytecode.object;

	const crowdBytecode =
		MTBArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale.evm
			.bytecode.object;

	const crowdAbi =
		MTBArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale.abi;

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
		const toastId = toast.loading(t("deploy_starting"), {
			position: "top-right",
			theme: "dark",
		});

		try {
			if (!account) throw new Error("Conecta tu wallet primero");

			const v = getValues();
			const imageFile = v.tokenImage?.[0];
			let base64Image = null;

			if (imageFile) {
				base64Image = await readFileAsBase64(imageFile);
			}

			const name = v.name?.trim();
			const symbol = v.symbol?.trim();
			const capInput = String(v.cap || "").trim();
			if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
				throw new Error("Nombre, símbolo y cap del token son obligatorios");
			}
			const capBN = ethers.utils.parseEther(capInput);

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

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			toast.update(toastId, {
				render: t("sign_token_deploy"),
				isLoading: true,
				autoClose: 2000,
			});
			const tokenFactory = new ethers.ContractFactory(
				tokenAbi,
				tokenBytecode,
				signer
			);
			const token = await tokenFactory.deploy(name, symbol, capBN, capBN);
			await token.deployed();
			setTokenAddress(token.address);
			console.log("Token address:", token.address);
			toast.update(toastId, {
				render: t("token_deployed"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.update(toastId, {
				render: t("verifying_token"),
				isLoading: true,
				type: "info",
				autoClose: 2000,
			});
			let tokenVerified = false;
			const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
			const tokenCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["string", "string", "uint256", "uint256"],
					[name, symbol, capBN, capBN]
				)
				.replace(/^0x/, "");
			await delay(15000);
			const tokenVerifyResponse = await axios.post(
				`${openvinoApiURL}/verify-contract`,
				{
					network: activeNetwork,
					address: token.address,
					contractName: "contracts/MTB.sol:MTB",

					compilerVersion: "v0.8.22+commit.4fc1097e",
					codeformat: "solidity-standard-json-input",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: tokenCtorEncoded,
				},
				{ headers: { "x-api-key": openvinoApiKey } }
			);
			console.log("Token Verify response: ", tokenVerifyResponse.data);

			// let tokenVerified = false;
			// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
			// while (!tokenVerified) {
			// 	const checkStatus = await axios.get(
			// 		`${openvinoApiURL}/checkverifystatus`,
			// 		{
			// 			params: {
			// 				network: activeNetwork,
			// 				guid: tokenVerifyResponse.data.guid,
			// 			},
			// 			headers: { "x-api-key": openvinoApiKey },
			// 		}
			// 	);

			// 	if (checkStatus.data.status === "1") {
			// 		tokenVerified = true;
			// 		toast.update(toastId, {
			// 			render: t("token_verified_success"),
			// 			isLoading: false,
			// 			type: "success",
			// 			autoClose: 2000,
			// 		});
			// 	} else if (
			// 		checkStatus.data.status === "0" &&
			// 		checkStatus.data.result.toLowerCase().includes("pending")
			// 	) {
			// 		await delay(5000);
			// 	} else {
			// 		throw new Error(
			// 			`Fallo la verificación del Token: ${checkStatus.data.result}`
			// 		);
			// 	}
			// }

			toast.update(toastId, {
				render: t("token_verified_guid"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.update(toastId, {
				render: t("sign_crowdsale_deploy"),
				isLoading: true,
				type: "info",
				autoClose: 2000,
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
			setCrowdsaleAddress(crowdsale.address);
			console.log("Crowdsale address:", crowdsale.address);

			toast.update(toastId, {
				render: t("crowdsale_deployed"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.update(toastId, {
				render: t("verifying_crowdsale"),
				isLoading: true,
				type: "info",
				autoClose: 2000,
			});

			const crowdCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["address", "address", "uint256", "uint256", "uint256", "uint256"],
					[walletAddress, token.address, weiCapBN, openingTs, closingTs, rate]
				)
				.replace(/^0x/, "");
			await delay(15000);
			const crowdVerifyResponse = await axios.post(
				`${openvinoApiURL}/verify-contract`,
				{
					network: activeNetwork,
					address: crowdsale.address,
					contractName: "contracts/Crowdsale.sol:Crowdsale",
					compilerVersion: "v0.8.22+commit.4fc1097e",
					codeformat: "solidity-standard-json-input",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: crowdCtorEncoded,
				},
				{ headers: { "x-api-key": openvinoApiKey } }
			);

			console.log("Crowdsale Verify response: ", crowdVerifyResponse.data);

			// let crowdsaleVerify = false;
			//   const delayCrowdsale = (ms) =>
			//     new Promise((resolve) => setTimeout(resolve, ms));
			//   while (!crowdsaleVerify) {
			//     const checkStatus = await axios.get(
			//       `${openvinoApiURL}/checkverifystatus`,
			//       {
			//         params: {
			//           network: activeNetwork,
			//           guid: crowdVerifyResponse.data.guid,
			//         },
			//         headers: { "x-api-key": openvinoApiKey },
			//       }
			//     );
			//     console.log("Estado de verificacion de crowdsale:", checkStatus);

			//     if (checkStatus.data.status === "1") {
			//       crowdsaleVerify = true;
			//       toast.update(toastId, {
			//         render: t("crowdsale_verified_success"),
			//         isLoading: false,
			//         type: "success",
			//         autoClose: 2000,
			//       });
			//     } else if (
			//       checkStatus.data.status === "0" &&
			//       checkStatus.data.result.toLowerCase().includes("pending")
			//     ) {
			//       await delayCrowdsale(10000);
			//     } else if (
			//       checkStatus.data.status === "0" &&
			//       checkStatus.data.result.toLowerCase().includes("verified")
			//     ) {
			//       crowdsaleVerify = true;
			//       toast.update(toastId, {
			//         render: t("crowdsale_verified_success"),
			//         isLoading: false,
			//         type: "success",
			//         autoClose: 2000,
			//       });
			//     } else {
			//       throw new Error(
			//         `Fallo la verificación del Crowdsale: ${checkStatus.data.result}`
			//       );
			//     }
			//   }

			toast.update(toastId, {
				render: t("crowdsale_verified_guid"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.update(toastId, {
				render: t("sign_token_transfer_to_crowdsale"),
				isLoading: true,
				type: "info",
				autoClose: 2000,
			});

			await delay(15000);
			await provider.getBlockNumber();
			const txTransfer = await token.transfer(crowdsale.address, tokensBN);
			await txTransfer.wait();

			toast.update(toastId, {
				render: t("tokens_transferred_to_crowdsale"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.update(toastId, {
				render: t("deployment_and_verification_done"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});
		} catch (error) {
			console.error("DEPLOY & VERIFY ERROR", error);
			toast.update(toastId, {
				render: error.message || "Error durante despliegue/verificación",
				isLoading: false,
				type: "error",
				autoClose: 2000,
			});
		} finally {
			setLoading(false);
		}
	};
	const readFileAsBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
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
						<div>
							<label className="font-bold">{t("REDEEM_wallet_address")}</label>
							<input
								type="text"
								{...register("redeemWalletAddress")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("token_logo")}</label>

							<input
								type="file"
								accept="image/*"
								{...register("tokenImage")}
								className="w-full mt-1 p-2 border rounded bg-white"
							/>
						</div>
					</div>

					{/* Crowdsale Config */}
					<h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>
					<div className="grid lg:grid-cols-2 gap-4">
						<div>
							<label className="font-bold">{t("VCO_wallet_address")}</label>
							<input
								type="text"
								{...register("walletAddress")}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>
						<div>
							<label className="font-bold">{t("price_per_token")}</label>

							<input
								type="number"
								step="any"
								{...register("pricePerToken")}
								onChange={(e) => {
									const price = parseFloat(e.target.value);
									if (!isNaN(price) && price > 0) {
										const newRate = Math.floor(1 / price);
										setValue("rate", newRate);
									} else {
										setValue("rate", 0);
									}
								}}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>

						<div>
							<label className="font-bold">{t("rate_tokens_per_eth")}</label>

							<input
								type="number"
								{...register("rate")}
								onChange={(e) => {
									const rate = parseFloat(e.target.value);
									if (!isNaN(rate) && rate > 0) {
										const newPrice = 1 / rate;
										setValue("pricePerToken", parseFloat(newPrice.toFixed(8))); // más preciso
									} else {
										setValue("pricePerToken", 0);
									}
								}}
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
						<div className="lg:col-span-[1]">
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
				{(tokenAddress || crowdsaleAddress) && (
					<div className="mt-8 space-y-2 text-center">
						{tokenAddress && (
							<>
								{console.log("Token address:", tokenAddress)}
								<p>
									{t("token_address")}:{" "}
									<a
										href={`https://${
											activeNetwork === "baseSepolia"
												? "sepolia.basescan.org"
												: "basescan.org"
										}/address/${tokenAddress}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 underline break-all"
									>
										{tokenAddress}
									</a>
								</p>
							</>
						)}
						{crowdsaleAddress && (
							<>
								{console.log("Crowdsale address:", crowdsaleAddress)}
								<p>
									{t("crowdsale_address")}:{" "}
									<a
										href={`https://${
											activeNetwork === "baseSepolia"
												? "sepolia.basescan.org"
												: "basescan.org"
										}/address/${crowdsaleAddress}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 underline break-all"
									>
										{crowdsaleAddress}
									</a>
								</p>
							</>
						)}
					</div>
				)}
			</div>
		</HomeLayout>
	);
};

export default Launch;
