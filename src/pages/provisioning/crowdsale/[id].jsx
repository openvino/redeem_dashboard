import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import HomeLayout from "@/components/HomeLayout";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { activeNetwork, openvinoApiKey, openvinoApiURL } from "@/config";

import {
	createTokenForLaunch,
	updateTokenInfo,
} from "@/utils/provisioningUtils";
import useLaunch from "@/hooks/useLaunch";
import { isAdminUser } from "@/utils/authUtils";
import { formatDateForInput, toTimestamp } from "@/utils/dateUtils";
import { useIpfsUpload } from "@/hooks/useIpfsUpload";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { chain, client } from "@/config/thirdwebClient";

const Launch = () => {
	const router = useRouter();
	const { id, edit } = router.query;

	const {
		token,
		setToken,
		loading,
		setLoading,
		tokenAddress,
		setTokenAddress,
		crowdsaleAddress,
		setCrowdsaleAddress,
		register,
		handleSubmit,
		setValue,
		getValues,
		reset,
		account,
		t,
		tokenAbi,
		tokenBytecode,
		crowdBytecode,
		crowdAbi,
		session,
		wineries,
		selectedWinery,
		setSelectedWinery,
	} = useLaunch(id);

	const { uploadImage, uploading, ipfsUrl } = useIpfsUpload();

	const [isEditMode, setIsEditMode] = useState(false);
	const [isViewMode, setIsViewMode] = useState(false);
	const [isCreateMode, setIsCreateMode] = useState(false);
	const [deploymentComplete, setDeploymentComplete] = useState(false);
	const [disableDeploy, setDisableDeploy] = useState(false);
	const [transferDisabled, setTransferDisabled] = useState(true);
	const [transferDone, setTransferDone] = useState(false);

	useEffect(() => {
		if (tokenAddress && crowdsaleAddress) {
			setDeploymentComplete(true);
		}
	}, [tokenAddress, crowdsaleAddress]);

	useEffect(() => {
		console.log(token);

		if (token?.transfered_to_crowdsale) {
			setTransferDone(true);
			setTransferDisabled(true);
		}
	}, [token]);
	useEffect(() => {
		if (!router.isReady) return;

		const editParam = router.query.edit;
		const idParam = router.query.id;

		setIsEditMode(editParam === "true" && isAdminUser(session));
		setIsViewMode(idParam && editParam !== "true");
		setIsCreateMode(idParam === "launch" && isAdminUser(session));
	}, [router.isReady, router.query, session]);

	useEffect(() => {
		if (token) {
			if (token.transfered_to_crowdsale) {
				setDisableDeploy(true);
				setTransferDisabled(true);
			} else if (token.tokenAddress && token.crowdsaleAddress) {
				setDisableDeploy(true);
				setTransferDisabled(false);
			}

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
				openingTime: formatDateForInput(token.openingTime),
				closingTime: formatDateForInput(token.closingTime),
				tokensToCrowdsale: token.tokensToCrowdsale,
			});
			const newPrice = 1 / token.rate;
			setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
		}
	}, [token, reset, setValue]);

	const isFieldDisabled = () => {
		if (isViewMode && !isEditMode && !isCreateMode) return true;
		if (isCreateMode || isEditMode) return false;
		return true;
	};

	const deployToken = async (toastId) => {
		if (!account) throw new Error("Connect wallet");
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});

		const v = getValues();
		const name = v.name?.trim();
		const symbol = v.symbol?.trim();
		const capInput = String(v.cap || "").trim();
		if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
			throw new Error("Missing name, symbol or cap");
		}

		const capBN = ethers.utils.parseEther(capInput);

		toast.update(toastId, {
			render: "Deploying token contract...",
			isLoading: true,
		});

		const tokenFactory = new ethers.ContractFactory(
			tokenAbi,
			tokenBytecode,
			signer
		);

		const token = await tokenFactory.deploy(name, symbol, capBN, capBN);

		await token.deployed();

		setTokenAddress(token.address);

		toast.update(toastId, {
			render: "Token deployed, verifying on BaseScan...",
			isLoading: true,
		});

		const tokenCtorEncoded = ethers.utils.defaultAbiCoder
			.encode(
				["string", "string", "uint256", "uint256"],
				[name, symbol, capBN, capBN]
			)
			.replace(/^0x/, "");

		await new Promise((res) => setTimeout(res, 15000));

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
		setToken((prevToken) => {
			return {
				...prevToken,
				token_address: token.address,
			};
		});
		return token;
	};

	const deployCrowdsale = async (token, toastId) => {
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});
		const v = getValues();
		const symbol = v.symbol?.trim();
		const walletAddress = v.walletAddress?.trim();
		if (!walletAddress) throw new Error("Wallet address missing");

		const rate = Number(String(v.rate || "").trim());

		const openingTs = Math.floor(toTimestamp(v.openingTime));
		const closingTs = Math.floor(toTimestamp(v.closingTime));

		const tokensBN = ethers.utils.parseEther(
			String(v.tokensToCrowdsale || "").trim()
		);

		toast.update(toastId, {
			render: "Deploying crowdsale contract...",
			isLoading: true,
		});

		const crowdFactory = new ethers.ContractFactory(
			crowdAbi,
			crowdBytecode,
			signer
		);
		const crowdsale = await crowdFactory.deploy(
			walletAddress,
			token.address,
			tokensBN.div(rate),
			openingTs,
			closingTs,
			rate
		);
		await crowdsale.deployed();

		setCrowdsaleAddress(crowdsale.address);
		await updateTokenInfo(symbol, { crowdsale_address: crowdsale.address });
		setToken((prevToken) => {
			return {
				...prevToken,
				crowdsale_address: crowdsale.address,
			};
		});
		await new Promise((res) => setTimeout(res, 8000));

		return crowdsale;
	};

	const transferTokensToCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});
		const toastId = toast.loading(t("Wait please..."), {
			theme: "dark",
		});
		setLoading(true);

		try {
			const code = await signer.provider.getCode(crowdsaleAddress);
			if (code === "0x") {
				throw new Error("Crowdsale contract not found on-chain.");
			}

			const tokensBN = ethers.utils.parseEther(
				String(getValues().tokensToCrowdsale).trim()
			);

			const tokenContract = new ethers.Contract(
				token?.token_address,
				tokenAbi,
				signer
			);

			try {
				await tokenContract.estimateGas.transfer(crowdsaleAddress, tokensBN);
				console.log("Gas estimation succeeded, proceeding to transfer");
			} catch (err) {
				console.error("Gas estimation failed:", err);
				throw new Error(
					"Cannot transfer tokens: gas estimation failed. Make sure the contract is ready."
				);
			}

			toast.update(toastId, {
				render: t("Transferring tokens to crowdsale..."),
				isLoading: true,
			});

			const tx = await tokenContract.transfer(crowdsaleAddress, tokensBN);
			await tx.wait();

			console.log("Tokens transferred!");
			toast.update(toastId, {
				render: t("tokens_transferred"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			await updateTokenInfo(getValues().symbol, {
				transfered_to_crowdsale: true,
			});
			setTransferDisabled(true);
			setTransferDone(true);
			router.push("/provisioning");
		} catch (error) {
			console.error("Transfer failed:", error);
			toast.update(toastId, {
				render: `${error.message || "Transfer failed"}`,
				isLoading: false,
				type: "error",
				autoClose: 5000,
			});
			setTransferDisabled(false);
		} finally {
			setLoading(false);
		}
	};

	const handleDeployAll = async () => {
		setLoading(true);
		const toastId = toast.loading("⏳ Starting deployment...", {
			theme: "dark",
		});

		try {
			const v = getValues();
			if (!v.tokensToCrowdsale || isNaN(v.tokensToCrowdsale)) {
				throw new Error("Invalid number of tokens to transfer");
			}

			const provider = new ethers.providers.Web3Provider(window.ethereum);

			// Deploy token
			const token = await deployToken(toastId);
			setTokenAddress(token.address);

			// Confirm token deployment
			toast.update(toastId, {
				render: t("Wait please..."),
				isLoading: true,
			});
			while (true) {
				const code = await provider.getCode(token.address);
				if (code !== "0x") break;
				await new Promise((res) => setTimeout(res, 4000));
			}

			// Deploy crowdsale
			const crowdsale = await deployCrowdsale(token, toastId);
			setCrowdsaleAddress(crowdsale.address);

			// Confirm crowdsale deployment
			toast.update(toastId, {
				render: t("Wait please..."),
				isLoading: true,
			});
			while (true) {
				const code = await provider.getCode(crowdsale.address);
				if (code !== "0x") break;
				await new Promise((res) => setTimeout(res, 4000));
			}

			toast.update(toastId, {
				render: t("deploy_complete"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			setDisableDeploy(true);
			setTransferDisabled(false);
			setDeploymentComplete(true);
		} catch (error) {
			console.error("DEPLOY ERROR", error);
			toast.update(toastId, {
				render: `${error.message || "Deployment failed"}`,
				isLoading: false,
				type: "error",
				autoClose: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	const createTokenInDatabase = async () => {
		const v = getValues();
		const name = v.name?.trim();
		const symbol = v.symbol?.trim();
		const cap = v.cap;
		const redeemWalletAddress = v.redeemWalletAddress?.trim();
		const tokenImage = v.tokenImage?.trim();
		const walletAddress = v.walletAddress?.trim();
		const rate = v.rate;
		const openingTime = v.openingTime;
		const closingTime = v.closingTime;
		const tokensToCrowdsale = v.tokensToCrowdsale;
		if (!name || !symbol || !cap || !redeemWalletAddress || !selectedWinery) {
			toast.error("Missing required fields");
			return;
		}
		setLoading(true);
		const toastId = toast.loading(
			isEditMode
				? "Updating token in database..."
				: "Saving token in database...",
			{ theme: "dark" }
		);
		try {
			if (isEditMode) {
				await updateTokenInfo(symbol, {
					name,
					symbol,
					cap,
					redeemWalletAddress,
					tokenImage,
					walletAddress,
					rate,
					openingTime,
					closingTime,
					tokensToCrowdsale,
					winery_id: selectedWinery,
				});
			} else {
				await createTokenForLaunch(symbol, {
					name,
					symbol,
					cap,
					redeemWalletAddress,
					tokenImage,
					walletAddress,
					rate,
					openingTime,
					closingTime,
					tokensToCrowdsale,
					winery_id: selectedWinery,
					token_address: "",
					crowdsale_address: "",
				});
			}
			toast.update(toastId, {
				render: isEditMode
					? "Token updated successfully!"
					: "Token saved successfully!",
				isLoading: false,
				type: "success",
				autoClose: 2000,
			});
			router.push("/provisioning");
		} catch (err) {
			console.error("Error saving token:", err);
			toast.update(toastId, {
				render: isEditMode ? "Failed to update token" : "Failed to save token",
				isLoading: false,
				type: "error",
				autoClose: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	const finalizeAndRenewCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});
		const toastId = toast.loading(t("finalizing_crowdsale"), {
			theme: "dark",
		});
		setLoading(true);

		try {
			const crowdsaleContract = new ethers.Contract(
				token?.crowdsale_address,
				crowdAbi,
				signer
			);

			const alreadyFinalized = await crowdsaleContract.isFinalized();
			if (!alreadyFinalized) {
				const finalizeTx = await crowdsaleContract.finalize();
				await finalizeTx.wait();

				toast.update(toastId, {
					render: t("crowdsale_finalized"),
					isLoading: true,
				});
			} else {
				console.log("Crowdsale already finalized. Skipping finalize...");
				toast.update(toastId, {
					render: "Crowdsale already finalized. Renewing...",
					isLoading: true,
				});
			}

			const tokenContract = new ethers.Contract(
				token.token_address,
				tokenAbi,
				signer
			);

			const walletAddress = await signer.getAddress();
			const walletBalance = await tokenContract.balanceOf(walletAddress);
			const totalTokens = ethers.utils.formatEther(walletBalance);

			console.log(`Wallet balance: ${totalTokens} tokens`);

			await updateTokenInfo(getValues().symbol, {
				cap: totalTokens,
				tokensToCrowdsale: totalTokens,
				transfered_to_crowdsale: false,
			});
			setToken((prev) => ({
				...prev,
				cap: totalTokens,
				tokensToCrowdsale: totalTokens,
				transfered_to_crowdsale: false,
			}));

			const v = getValues();
			console.log(v);

			const openingTs = Math.floor(toTimestamp(v.openingTime));
			const closingTs = Math.floor(toTimestamp(v.closingTime));

			const crowdFactory = new ethers.ContractFactory(
				crowdAbi,
				crowdBytecode,
				signer
			);

			toast.update(toastId, {
				render: "Deploying new crowdsale...",
				isLoading: true,
			});

			const newCrowdsale = await crowdFactory.deploy(
				v.walletAddress,
				token?.token_address,
				ethers.utils.parseEther(totalTokens).div(v.rate),
				openingTs,
				closingTs,
				v.rate
			);
			await newCrowdsale.deployed();

			await updateTokenInfo(getValues().symbol, {
				crowdsale_address: newCrowdsale.address,
			});
			setCrowdsaleAddress(newCrowdsale.address);

			toast.update(toastId, {
				render: t("crowdsale_renewed"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			setTransferDisabled(false);
			setTransferDone(false);
		} catch (error) {
			console.error("Finalize & Renew failed:", error);
			toast.update(toastId, {
				render: ` ${error.message || t("fin_and_renew_fail")}`,
				isLoading: false,
				type: "error",
				autoClose: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	const finalizeCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});
		const toastId = toast.loading(t("finalizing_crowdsale"), {
			theme: "dark",
		});
		setLoading(true);

		try {
			const crowdsaleContract = new ethers.Contract(
				token?.crowdsale_address,
				crowdAbi,
				signer
			);

			const alreadyFinalized = await crowdsaleContract.isFinalized();
			if (alreadyFinalized) {
				toast.update(toastId, {
					render: t("crowdsale_already_finalized"),
					isLoading: false,
					type: "info",
					autoClose: 3000,
				});
				setLoading(false);
				return;
			}

			const finalizeTx = await crowdsaleContract.finalize();
			await finalizeTx.wait();

			toast.update(toastId, {
				render: t("crowdsale_finalized"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			const tokenContract = new ethers.Contract(
				token?.token_address,
				tokenAbi,
				signer
			);

			const walletAddress = await signer.getAddress();
			const walletBalance = await tokenContract.balanceOf(walletAddress);
			const totalTokens = ethers.utils.formatEther(walletBalance);
			console.log({
				cap: totalTokens,
				transfered_to_crowdsale: false,
				crowdsale_address: "",
				crowdsale_finalized: true,
			});

			await updateTokenInfo(token?.symbol, {
				cap: totalTokens,
				transfered_to_crowdsale: false,
				crowdsale_address: "",
				crowdsale_finalized: true,
			});

			setToken((prev) => ({
				...prev,
				cap: totalTokens,
				crowdsaleAddress: "",
				transfered_to_crowdsale: false,
			}));
			setTransferDisabled(true);
			setDisableDeploy(false);
			router.push(`/provisioning`);
		} catch (error) {
			console.error("Finalize failed:", error);
			toast.update(toastId, {
				render: `${error.message || t("finalize_failed")}`,
				isLoading: false,
				type: "error",
				autoClose: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	const OnUpdateCrowdsale = async () => {
		await updateCrowdsale();
	};

	const updateCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client: client,
			chain: chain,
			account: account,
		});
		const toastId = toast.loading(t("updating_crowdsale"), {
			theme: "dark",
		});
		setLoading(true);

		try {
			const v = getValues();
			const newRate = Number(String(v.rate || "").trim());

			if (isNaN(newRate) || newRate <= 0) {
				throw new Error("Invalid rate value");
			}

			const crowdsaleContract = new ethers.Contract(
				token?.crowdsale_address,
				crowdAbi,
				signer
			);

			const currentRate = await crowdsaleContract.getRate();
			console.log(`Current rate: ${currentRate}, New rate: ${newRate}`);

			if (currentRate.toString() === newRate.toString()) {
				throw new Error("New rate is the same as the current rate");
			}

			const tx = await crowdsaleContract.updateRate(newRate);
			console.log("UpdateRate transaction sent:", tx.hash);

			await tx.wait();

			toast.update(toastId, {
				render: t("crowdsale_updated"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			await updateTokenInfo(token?.symbol, { rate: newRate });

			setToken((prev) => ({
				...prev,
				rate: newRate,
			}));
		} catch (error) {
			console.error("Update crowdsale failed:", error);
			toast.update(toastId, {
				render: error.message || t("crowdsale_update_failed"),
				isLoading: false,
				type: "error",
				autoClose: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<HomeLayout>
			<ToastContainer />
			<div className="p-4 w-full overflow-x-auto lg:overflow-x-hidden">
				<h1 className="text-2xl font-bold text-center mb-6">
					{t("update_crowdsale")}
				</h1>
				<form
					className="space-y-6 bg-[#F1EDE2] p-6 rounded-xl border-2 border-gray-200"
					onSubmit={handleSubmit((e) => e.preventDefault())}
				>
					{/* Crowdsale Config */}
					<h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>
					<div className="grid lg:grid-cols-2 gap-4">
						{/* Wallet Address */}
						<div>
							<label className="font-bold">{t("VCO_wallet_address")}</label>
							<input
								type="text"
								{...register("walletAddress")}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled={isFieldDisabled()}
							/>
						</div>

						{/* Price per Token */}
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

						{/* Rate */}
						<div>
							<label className="font-bold">{t("rate_tokens_per_eth")}</label>
							<input
								type="number"
								{...register("rate")}
								onChange={(e) => {
									const rate = parseFloat(e.target.value);
									if (!isNaN(rate) && rate > 0) {
										const newPrice = 1 / rate;
										setValue("pricePerToken", parseFloat(newPrice.toFixed(8)));
									} else {
										setValue("pricePerToken", 0);
									}
								}}
								className="w-full mt-1 p-2 border rounded"
								required
							/>
						</div>

						{/* Opening Time */}
						<div>
							<label className="font-bold">{t("opening_time")}</label>
							<input
								type="datetime-local"
								{...register("openingTime")}
								className="w-full mt-1 p-2 border rounded"
								disabled={isFieldDisabled()}
							/>
						</div>

						{/* Closing Time */}
						<div>
							<label className="font-bold">{t("closing_time")}</label>
							<input
								type="datetime-local"
								{...register("closingTime")}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled={isFieldDisabled()}
							/>
						</div>

						{/* Tokens to Crowdsale */}
						<div className="lg:col-span-1">
							<label className="font-bold">{t("tokens_to_crowdsale")}</label>
							<input
								type="number"
								step="any"
								{...register("tokensToCrowdsale")}
								className="w-full mt-1 p-2 border rounded"
								required
								disabled={isFieldDisabled()}
							/>
						</div>
					</div>
					{/* Token Address (solo si existe) */}
					{token?.token_address && (
						<div className="lg:col-span-3">
							<label className="font-bold">{t("token_address")}</label>
							<input
								type="text"
								value={token?.token_address}
								className="w-full mt-1 p-2 border rounded bg-gray-100"
								disabled
							/>
						</div>
					)}
					{token?.crowdsale_address && (
						<div className="lg:col-span-3">
							<label className="font-bold">{t("crowdsale_address")}</label>
							<input
								type="text"
								value={token?.crowdsale_address}
								className="w-full mt-1 p-2 border rounded bg-gray-100"
								disabled
							/>
						</div>
					)}
					{/* Buttons */}

					<div className="flex justify-between space-x-4 mt-4">
						{/* Volver */}
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-2 bg-gray-300 rounded"
						>
							{t("volver")}
						</button>
						<div className="flex space-x-4">
							{token?.crowdsale_address && (
								<button
									type="button"
									onClick={OnUpdateCrowdsale}
									className="px-6 py-2 bg-purple-400 rounded"
								>
									{t("update!")}
								</button>
							)}
							{/* Guardar token en DB en modos crear o editar */}
							{(isCreateMode || isEditMode) && (
								<button
									type="button"
									onClick={createTokenInDatabase}
									disabled={loading}
									className={`px-6 py-2 rounded text-white ${
										loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700"
									}`}
								>
									{t("save_token")}
								</button>
							)}

							{/* Acciones */}
							{isViewMode &&
								!token?.crowdsale_finalized &&
								!token?.tokens_transfered && (
									<>
										<button
											type="button"
											onClick={transferTokensToCrowdsale}
											disabled={loading || transferDisabled}
											className={`px-6 py-2 rounded text-white ${
												loading || transferDisabled
													? "bg-gray-400 cursor-not-allowed"
													: "bg-blue-600"
											}`}
										>
											{t("transfer_tokens_to_crowdsale")}
										</button>
									</>
								)}
							{isViewMode && transferDone && !token?.crowdsale_finalized && (
								<button
									type="button"
									onClick={finalizeAndRenewCrowdsale}
									disabled={loading}
									className={`px-6 py-2 rounded text-white ${
										loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-700"
									}`}
								>
									{t("finalize_and_renew")}
								</button>
							)}
							{isViewMode && transferDone && !token?.crowdsale_finalized && (
								<button
									type="button"
									onClick={finalizeCrowdsale}
									disabled={loading}
									className={`px-6 py-2 rounded text-white ${
										loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
									}`}
								>
									{t("finalize_crowdsale")}
								</button>
							)}
						</div>
					</div>
				</form>
				{(tokenAddress || crowdsaleAddress) && !token?.crowdsale_finalized && (
					<div className="mt-8 space-y-2 text-center">
						{tokenAddress && (
							<>
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
