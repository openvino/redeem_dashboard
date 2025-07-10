import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import axios from "axios";
import HomeLayout from "@/components/HomeLayout";
import OpenvinoTokenArtifact from "../../../contracts/artifacts/OVT.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { activeNetwork, openvinoApiKey, openvinoApiURL } from "@/config";
import clientAxios from "@/config/clientAxios";

const Launch = () => {
	const [token, setToken] = useState({});
	const [loading, setLoading] = useState(false);
	const [tokenAddress, setTokenAddress] = useState("");
	const [crowdsaleAddress, setCrowdsaleAddress] = useState("");
	const router = useRouter();
	const account = useActiveAccount();
	const { id } = router.query;
	const { t } = useTranslation();
	const { register, handleSubmit, setValue, getValues, reset } = useForm({
		defaultValues: {
			id: "",
			name: "",
			symbol: "",
			cap: "",
			redeemWalletAddress: "",
			tokenImage: "",
			walletAddress: "",
			pricePerToken: "",
			rate: "",
			openingTime: "",
			closingTime: "",
			tokensToCrowdsale: "",
		},
	});

	useEffect(() => {
		console.log(id);
		if (id) {
			tokensLaunching(id);
		}
	}, []);

	useEffect(() => {
		if (token) {
			const isValidDate = (date) => {
				const d = new Date(date);
				return d instanceof Date && !isNaN(d);
			};

			reset({
				id: token.id,
				name: token.name,
				symbol: token.symbol,
				cap: token.cap,
				redeemWalletAddress: token.redeemWalletAddress,
				tokenImage: token.tokenImage,
				walletAddress: token.walletAddress,
				pricePerToken: token.pricePerToken,
				rate: token.rate,
				openingTime: token.openingTime,
				closingTime: isValidDate(token.closingTime)
					? new Date(token.closingTime).toISOString().split("T")[0]
					: "",
				tokensToCrowdsale: token.tokensToCrowdsale,
			});
			const newPrice = 1 / token.rate;
			setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
		}
	}, [token, reset]);

	const tokenAbi =
		OpenvinoTokenArtifact.output.contracts["contracts/OpenVinoToken.sol"]
			.OpenVinoToken.abi;

	const tokenBytecode =
		OpenvinoTokenArtifact.output.contracts["contracts/OpenVinoToken.sol"]
			.OpenVinoToken.evm.bytecode.object;

	const crowdBytecode =
		OpenvinoTokenArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale
			.evm.bytecode.object;

	const crowdAbi =
		OpenvinoTokenArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale
			.abi;
	const tokensLaunching = async (winery_id) => {
		try {
			const response = await clientAxios.get(`/tokenLaunchRoute`, {
				params: { winery_id },
			});

			console.log(response.data);

			setToken(response.data);

			return response.data;
		} catch (error) {
			console.error(error);
		}
	};
	const updateTokenInfo = async (symbol, tokenFields) => {
		try {
			const response = await clientAxios.patch(`/tokenLaunchRoute`, {
				params: { id: symbol, ...tokenFields },
			});

			console.log(response.data);

			setToken(response.data);

			return response.data;
		} catch (error) {
			console.error(error);
		}
	};
	const deployToken = async () => {
		if (!account) throw new Error("Conecta tu wallet primero");

		const v = getValues();
		const name = v.name?.trim();
		const symbol = v.symbol?.trim();
		const capInput = String(v.cap || "").trim();

		if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
			throw new Error("Nombre, símbolo y cap del token son obligatorios");
		}

		const capBN = ethers.utils.parseEther(capInput);
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();

		const toastId = toast.loading(t("deploying_token"), { theme: "dark" });

		try {
			const tokenFactory = new ethers.ContractFactory(
				tokenAbi,
				tokenBytecode,
				signer
			);
			const token = await tokenFactory.deploy(name, symbol, capBN, capBN);
			await token.deployed();

			setTokenAddress(token.address);
			console.log("✅ Token address:", token.address);

			toast.update(toastId, {
				render: t("token_deployed"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			const tokenCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["string", "string", "uint256", "uint256"],
					[name, symbol, capBN, capBN]
				)
				.replace(/^0x/, "");

			await axios.post(
				`${openvinoApiURL}/verify-contract`,
				{
					network: activeNetwork,
					address: token.address,
					contractName: "contracts/OpenVinoToken.sol:OpenVinoToken",
					compilerVersion: "v0.8.22+commit.4fc1097e",
					codeformat: "solidity-standard-json-input",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: tokenCtorEncoded,
				},
				{ headers: { "x-api-key": openvinoApiKey } }
			);

			await updateTokenInfo(symbol, { token_address: token.address });
			return token;
		} catch (error) {
			toast.update(toastId, {
				render: error.message || "Error al desplegar el token",
				isLoading: false,
				type: "error",
				autoClose: 2000,
			});
			throw error;
		}
	};

	const deployCrowdsale = async (token) => {
		const v = getValues();
		const symbol = v.symbol?.trim();
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
		const capBN = ethers.utils.parseEther(String(v.cap || "").trim());

		if (rate <= 0 || !v.openingTime || !v.closingTime || tokensBN.lte(0)) {
			throw new Error("Completa correctamente todos los campos del crowdsale");
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

		const toastId = toast.loading(t("sign_crowdsale_deploy"), {
			theme: "dark",
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
		await updateTokenInfo(symbol, { crowdsale_address: crowdsale.address });
		toast.update(toastId, {
			render: t("crowdsale_deployed"),
			isLoading: false,
			type: "success",
			autoClose: 2000,
		});

		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		const crowdCtorEncoded = ethers.utils.defaultAbiCoder
			.encode(
				["address", "address", "uint256", "uint256", "uint256", "uint256"],
				[walletAddress, token.address, weiCapBN, openingTs, closingTs, rate]
			)
			.replace(/^0x/, "");
		await delay(15000);

		await axios.post(
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

		return crowdsale;
	};
	const handleDeployAll = async () => {
		setLoading(true);

		try {
			const token = await deployToken();
			const crowdsale = await deployCrowdsale(token);

			const toastId = toast.loading(t("sign_token_transfer_to_crowdsale"), {
				theme: "dark",
			});

			const tokensBN = ethers.utils.parseEther(
				String(getValues().tokensToCrowdsale || "").trim()
			);
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			await provider.getBlockNumber();

			const txTransfer = await token.transfer(crowdsale.address, tokensBN);
			await txTransfer.wait();

			toast.update(toastId, {
				render: t("tokens_transferred_to_crowdsale"),
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});

			toast.success(t("deployment_and_verification_done"), { theme: "dark" });
		} catch (error) {
			console.error("DEPLOY & VERIFY ERROR", error);
			toast.error("Error durante despliegue/verificación");
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
								disabled
							/>
						</div>
						<div>
							<label className="font-bold">{t("token_symbol")}</label>
							<input
								{...register("symbol")}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled
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
								disabled
							/>
						</div>
						<div>
							<label className="font-bold">{t("REDEEM_wallet_address")}</label>
							<input
								type="text"
								{...register("redeemWalletAddress")}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled
							/>
						</div>
						<div>
							<label className="font-bold">{t("token_logo")}</label>

							<input
								type="file"
								accept="image/*"
								{...register("tokenImage")}
								className="w-full mt-1 p-2 border rounded bg-white"
								disabled
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
								disabled
							/>
						</div>
						<div>
							<label className="font-bold">{t("price_per_token")}</label>

							<input
								type="number"
								step="any"
								{...register("pricePerToken")}
								// onChange={(e) => {
								// 	const price = parseFloat(e.target.value);
								// 	if (!isNaN(price) && price > 0) {
								// 		const newRate = Math.floor(1 / price);
								// 		setValue("rate", newRate);
								// 	} else {
								// 		setValue("rate", 0);
								// 	}
								// }}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled
							/>
						</div>

						<div>
							<label className="font-bold">{t("rate_tokens_per_eth")}</label>

							<input
								type="number"
								{...register("rate")}
								// onChange={(e) => {
								// 	const rate = parseFloat(e.target.value);
								// 	if (!isNaN(rate) && rate > 0) {
								// 		const newPrice = 1 / rate;
								// 		setValue("pricePerToken", parseFloat(newPrice.toFixed(8))); // más preciso
								// 	} else {
								// 		setValue("pricePerToken", 0);
								// 	}
								// }}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled
							/>
						</div>

						<div>
							<label className="font-bold">{t("opening_time")}</label>
							<input
								type="text"
								value={new Date(token.openingTime).toLocaleString()} // o usa tu formato preferido
								className="w-full mt-1 p-2 border rounded"
								disabled
							/>
						</div>
						<div>
							<label className="font-bold">{t("closing_time")}</label>
							<input
								type="text"
								value={new Date(token.closingTime).toLocaleString()}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled
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
								disabled
							/>
						</div>
					</div>

					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-2 bg-gray-300 rounded"
							disabled
						>
							{t("volver")}
						</button>
						<button
							type="button"
							onClick={handleDeployAll}
							disabled={loading}
							className="px-6 py-2 bg-green-700 text-white rounded"
						>
							{t("deploy_token")}
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
