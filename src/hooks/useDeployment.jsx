import { useEffect, useState } from "react";
import { activeNetwork, openvinoApiURL, openvinoApiKey } from "@/config";
import { chain, client } from "@/config/thirdwebClient";
import { tokenLaunching, updateTokenInfo } from "@/utils";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useActiveAccount } from "thirdweb/react";
import {
	showLoadingToast,
	updateErrorToast,
	updateSuccessToast,
} from "../../helpers/toastHelpers";
import { useTranslation } from "react-i18next";
import { deployContract } from "@/utils/deplyContract";
import {
	tokenAbi,
	crowdAbi,
	crowdBytecode,
	tokenBytecode,
} from "@/contracts/contractsAbi";
import { toTimestamp } from "@/utils";
const useDeployment = (
	getValues,
	setTransferDisabled,
	setTransferDone,
	setDisableDeploy
) => {
	const [token, setToken] = useState({});
	const [loading, setLoading] = useState(false);
	const [tokenAddress, setTokenAddress] = useState("");
	const [crowdsaleAddress, setCrowdsaleAddress] = useState("");
	const [selectedWinery, setSelectedWinery] = useState("");
	const [deploymentComplete, setDeploymentComplete] = useState(false);
	const account = useActiveAccount();
	const router = useRouter();
	const { id } = router.query;
	const { t } = useTranslation();

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));
	const v = getValues();

	useEffect(() => {
		const fetchTokens = async () => {
			if (id) {
				const token = await tokenLaunching(id);
				setSelectedWinery(token.winery_id);
				setToken(token);
				setTokenAddress(token.token_address || "");
				setCrowdsaleAddress(token.crowdsale_address || "");
			}
		};
		fetchTokens();
	}, []);

	useEffect(() => {
		if (tokenAddress && crowdsaleAddress) {
			setDeploymentComplete(true);
		}
	}, [tokenAddress, crowdsaleAddress]);

	const verifyContract = async (address, name, constructorArgs) => {
		await delay(15000);
		return axios.post(
			`${openvinoApiURL}/verify-contract`,
			{
				network: activeNetwork,
				address,
				contractName: name,
				compilerVersion: "v0.8.22+commit.4fc1097e",
				codeformat: "solidity-standard-json-input",
				optimizationUsed: "1",
				runs: "200",
				constructorArgs,
			},
			{
				headers: { "x-api-key": openvinoApiKey },
			}
		);
	};

	const deployToken = async (toastId) => {
		const signer = await ethers5Adapter.signer.toEthers({
			client,
			chain,
			account,
		});

		if (!account) throw new Error("Connect wallet");

		const name = v.name?.trim();
		const symbol = v.symbol?.trim();
		const capInput = String(v.cap || "").trim();
		if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
			throw new Error("Missing name, symbol or cap");
		}
		const capBN = ethers.utils.parseEther(capInput);
		showLoadingToast(toastId, t("Deploying token..."));

		const token = await deployContract(tokenAbi, tokenBytecode, signer, [
			name,
			symbol,
			capBN,
			capBN,
		]);

		await token.deployed();
		setTokenAddress(token.address);
		showLoadingToast(toastId, "Token deployed, verifying on BaseScan...");

		const tokenCtorEncoded = ethers.utils.defaultAbiCoder
			.encode(
				["string", "string", "uint256", "uint256"],
				[name, symbol, capBN, capBN]
			)
			.replace(/^0x/, "");

		await verifyContract(
			token.address,
			"contracts/OpenVinoToken.sol:OpenVinoToken",
			tokenCtorEncoded
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
			client,
			chain,
			account,
		});

		const v = getValues();
		const symbol = v.symbol?.trim();
		const walletAddress = v.wallet_address?.trim();
		const deployedTokenAddress = token?.address || token?.token_address;
		if (!deployedTokenAddress) throw new Error("Token address missing");
		if (!walletAddress) throw new Error("Wallet address missing");

		const rate = parseInt(String(v.rate || "").trim());
		if (!rate || isNaN(rate)) throw new Error("Rate must be a valid integer");

		const openingTs = Math.floor(toTimestamp(v.opening_time));
		const closingTs = Math.floor(toTimestamp(v.closing_time));

		const tokensBN = ethers.utils.parseEther(
			String(v.tokens_to_crowdsale || "").trim()
		);

		const rateBN = ethers.BigNumber.from(rate);
		const weiCapBN = tokensBN.div(rateBN);
		if (weiCapBN.isZero())
			throw new Error("Rate demasiado alto para los tokens");

		showLoadingToast(toastId, "Deploying crowdsale contract...");

		const crowdsale = await deployContract(crowdAbi, crowdBytecode, signer, [
			walletAddress,
			deployedTokenAddress,
			weiCapBN,
			openingTs,
			closingTs,
			rate,
		]);

		await crowdsale.deployed();

		setCrowdsaleAddress(crowdsale.address);
		await updateTokenInfo(symbol, { crowdsale_address: crowdsale.address });
		setToken((prevToken) => ({
			...prevToken,
			crowdsale_address: crowdsale.address,
		}));

		const crowdCtorEncoded = ethers.utils.defaultAbiCoder
			.encode(
				["address", "address", "uint256", "uint256", "uint256", "uint256"],
				[walletAddress, deployedTokenAddress, weiCapBN, openingTs, closingTs, rate]
			)
			.replace(/^0x/, "");

		await delay(15000);

		await verifyContract(
			crowdsale.address,
			"contracts/Crowdsale.sol:Crowdsale",
			crowdCtorEncoded
		);

		return crowdsale;
	};
	const finalizeAndRenewCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client,
			chain,
			account,
		});

		const toastId = toast.loading(t("finalizing_crowdsale"), { theme: "dark" });
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

			const v = getValues();

			const walletAddress = String(v.wallet_address || "").trim();
			if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
				throw new Error("Wallet address inválido o no definido");
			}

			let totalTokens = v.tokens_to_crowdsale;

			if (!totalTokens || isNaN(Number(totalTokens))) {
				const walletBalance = await tokenContract.balanceOf(walletAddress);
				totalTokens = ethers.utils.formatEther(walletBalance);
			}

			const tokensBN = ethers.utils.parseEther(String(totalTokens));
			const rate = Number(String(v.rate || "").trim());
			const weiCapBN = tokensBN.div(rate);

			if (weiCapBN.isZero()) {
				throw new Error("Rate demasiado alto para los tokens");
			}

			const openingTs = Math.floor(toTimestamp(v.opening_time));
			const closingTs = Math.floor(toTimestamp(v.closing_time));

			toast.update(toastId, {
				render: "Deploying new crowdsale...",
				isLoading: true,
			});

			const crowdFactory = new ethers.ContractFactory(
				crowdAbi,
				crowdBytecode,
				signer
			);

			const newCrowdsale = await crowdFactory.deploy(
				walletAddress,
				token.token_address,
				weiCapBN,
				openingTs,
				closingTs,
				rate
			);
			await newCrowdsale.deployed();

			await updateTokenInfo(v.symbol, {
				cap: totalTokens,
				tokens_to_crowdsale: totalTokens,
				transfered_to_crowdsale: false,
				crowdsale_address: newCrowdsale.address,
			});

			setToken((prev) => ({
				...prev,
				cap: totalTokens,
				tokens_to_crowdsale: totalTokens,
				transfered_to_crowdsale: false,
				crowdsale_address: newCrowdsale.address,
			}));

			setCrowdsaleAddress(newCrowdsale.address);

			toast.update(toastId, {
				render: t("crowdsale_renewed"),
				isLoading: false,
				type: "success",
				autoClose: 4000,
			});

			const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
			const crowdCtorEncoded = ethers.utils.defaultAbiCoder
				.encode(
					["address", "address", "uint256", "uint256", "uint256", "uint256"],
					[
						walletAddress,
						token.token_address,
						weiCapBN,
						openingTs,
						closingTs,
						rate,
					]
				)
				.replace(/^0x/, "");
			await delay(15000);
			setTransferDisabled(false);
			setTransferDone(false);
			await axios.post(
				`${openvinoApiURL}/verify-contract`,
				{
					network: activeNetwork,
					address: newCrowdsale.address,
					contractName: "contracts/Crowdsale.sol:Crowdsale",
					compilerVersion: "v0.8.22+commit.4fc1097e",
					codeformat: "solidity-standard-json-input",
					optimizationUsed: "1",
					runs: "200",
					constructorArgs: crowdCtorEncoded,
				},
				{
					headers: { "x-api-key": openvinoApiKey },
				}
			);
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

	// const finalizeAndRenewCrowdsale = async () => {
	// 	const signer = await ethers5Adapter.signer.toEthers({
	// 		client,
	// 		chain,
	// 		account,
	// 	});
	// 	const toastId = toast.loading(t("finalizing_crowdsale"), {
	// 		theme: "dark",
	// 	});
	// 	setLoading(true);

	// 	try {
	// 		const crowdsaleContract = new ethers.Contract(
	// 			token?.crowdsale_address,
	// 			crowdAbi,
	// 			signer
	// 		);

	// 		const alreadyFinalized = await crowdsaleContract.isFinalized();
	// 		if (!alreadyFinalized) {
	// 			const finalizeTx = await crowdsaleContract.finalize();
	// 			await finalizeTx.wait();
	// 			showLoadingToast(toastId, t("renewing_crowdsale"));
	// 		} else {
	// 			showLoadingToast(toastId, "Crowdsale already finalized. Renewing...");
	// 		}

	// 		const tokensCapBN = await crowdsaleContract.cap();
	// 		const tokensCap = ethers.utils.formatEther(tokensCapBN);

	// 		await updateTokenInfo(getValues().symbol, {
	// 			cap: tokensCap,
	// 			tokens_to_crowdsale: tokensCap,
	// 			transfered_to_crowdsale: false,
	// 		});
	// 		setToken((prev) => ({
	// 			...prev,
	// 			cap: tokensCap,
	// 			tokens_to_crowdsale: tokensCap,
	// 			transfered_to_crowdsale: false,
	// 		}));

	// 		const rate = Number(String(v.rate || "").trim());
	// 		if (isNaN(rate) || rate <= 0) {
	// 			throw new Error("Invalid rate");
	// 		}

	// 		const openingTs = Math.floor(toTimestamp(v.opening_time));
	// 		const closingTs = Math.floor(toTimestamp(v.closing_time));

	// 		const weiCapBN = tokensCapBN.div(rate);
	// 		if (weiCapBN.isZero())
	// 			throw new Error("Rate demasiado alto para los tokens");

	// 		showLoadingToast(toastId, t("Deploying new crowdsale..."));

	// 		const newCrowdsale = await deployContract(
	// 			crowdAbi,
	// 			crowdBytecode,
	// 			signer,
	// 			[
	// 				v.wallet_address,
	// 				token?.token_address,
	// 				weiCapBN,
	// 				openingTs,
	// 				closingTs,
	// 				rate,
	// 			]
	// 		);

	// 		await newCrowdsale.deployed();

	// 		await updateTokenInfo(getValues().symbol, {
	// 			crowdsale_address: newCrowdsale.address,
	// 		});
	// 		setCrowdsaleAddress(newCrowdsale.address);

	// 		updateSuccessToast(toastId, t("crowdsale_renewed"));

	// 		const crowdCtorEncoded = ethers.utils.defaultAbiCoder
	// 			.encode(
	// 				["address", "address", "uint256", "uint256", "uint256", "uint256"],
	// 				[
	// 					v.wallet_address,
	// 					token?.token_address,
	// 					weiCapBN,
	// 					openingTs,
	// 					closingTs,
	// 					rate,
	// 				]
	// 			)
	// 			.replace(/^0x/, "");
	// 		await delay(15000);

	// 		await verifyContract(
	// 			newCrowdsale.address,
	// 			"contracts/Crowdsale.sol:Crowdsale",
	// 			crowdCtorEncoded
	// 		);

	// 		setTransferDisabled(false);
	// 		setTransferDone(false);
	// 	} catch (error) {
	// 		console.error("Finalize & Renew failed:", error);
	// 		updateErrorToast(toastId, error.message || t("fin_and_renew_fail"));
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	// const finalizeAndRenewCrowdsale = async () => {
	// 	const signer = await ethers5Adapter.signer.toEthers({
	// 		client,
	// 		chain,
	// 		account,
	// 	});
	// 	const toastId = toast.loading(t("finalizing_crowdsale"), {
	// 		theme: "dark",
	// 	});
	// 	setLoading(true);

	// 	try {
	// 		const crowdsaleContract = new ethers.Contract(
	// 			token?.crowdsale_address,
	// 			crowdAbi,
	// 			signer
	// 		);

	// 		const alreadyFinalized = await crowdsaleContract.isFinalized();
	// 		if (!alreadyFinalized) {
	// 			const finalizeTx = await crowdsaleContract.finalize();
	// 			await finalizeTx.wait();
	// 			showLoadingToast(toastId, t("renewing_crowdsale"));
	// 		} else {
	// 			showLoadingToast(toastId, "Crowdsale already finalized. Renewing...");
	// 		}

	// 		const tokenContract = new ethers.Contract(
	// 			token.token_address,
	// 			tokenAbi,
	// 			signer
	// 		);

	// 		const walletAddress = await signer.getAddress();
	// 		const walletBalance = await tokenContract.balanceOf(walletAddress);
	// 		const totalTokens = ethers.utils.formatEther(walletBalance);

	// 		await updateTokenInfo(getValues().symbol, {
	// 			cap: totalTokens,
	// 			tokens_to_crowdsale: totalTokens,
	// 			transfered_to_crowdsale: false,
	// 		});
	// 		setToken((prev) => ({
	// 			...prev,
	// 			cap: totalTokens,
	// 			tokens_to_crowdsale: totalTokens,
	// 			transfered_to_crowdsale: false,
	// 		}));

	// 		const tokensBN = ethers.utils.parseEther(
	// 			String(v.tokens_to_crowdsale || "").trim()
	// 		);

	// 		const rate = Number(String(v.rate || "").trim());

	// 		const weiCapBN = tokensBN.div(rate);
	// 		if (weiCapBN.isZero())
	// 			throw new Error("Rate demasiado alto para los tokens");

	// 		const openingTs = Math.floor(toTimestamp(v.opening_time));
	// 		const closingTs = Math.floor(toTimestamp(v.closing_time));

	// 		showLoadingToast(toastId, t("Deploying new crowdsale..."));

	// 		const newCrowdsale = await deployContract(
	// 			crowdAbi,
	// 			crowdBytecode,
	// 			signer,
	// 			[
	// 				v.wallet_address,
	// 				token?.token_address,
	// 				ethers.utils.parseEther(totalTokens).div(v.rate),
	// 				openingTs,
	// 				closingTs,
	// 				v.rate,
	// 			]
	// 		);

	// 		await newCrowdsale.deployed();
	// 		await updateTokenInfo(getValues().symbol, {
	// 			crowdsale_address: newCrowdsale.address,
	// 		});
	// 		setCrowdsaleAddress(newCrowdsale.address);
	// 		updateSuccessToast(toastId, t("crowdsale_renewed"));

	// 		const crowdCtorEncoded = ethers.utils.defaultAbiCoder
	// 			.encode(
	// 				["address", "address", "uint256", "uint256", "uint256", "uint256"],
	// 				[
	// 					v.wallet_address,
	// 					token?.token_address,
	// 					ethers.utils.parseEther(totalTokens).div(v.rate),
	// 					openingTs,
	// 					closingTs,
	// 					v.rate,
	// 				]
	// 			)
	// 			.replace(/^0x/, "");
	// 		await delay(15000);

	// 		await verifyContract(
	// 			newCrowdsale.address,
	// 			"contracts/Crowdsale.sol:Crowdsale",
	// 			crowdCtorEncoded
	// 		);

	// 		setTransferDisabled(false);
	// 		setTransferDone(false);
	// 	} catch (error) {
	// 		console.error("Finalize & Renew failed:", error);
	// 		updateErrorToast(toastId, error.message || t("fin_and_renew_fail"));
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const transferTokensToCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client,
			chain,
			account,
		});
		const toastId = toast.loading(t("Wait please..."), {
			theme: "dark",
		});
		setLoading(true);

		try {
			const activeCrowdsaleAddress = crowdsaleAddress || token?.crowdsale_address;
			const code = await signer.provider.getCode(activeCrowdsaleAddress);
			if (code === "0x") {
				throw new Error("Crowdsale contract not found on-chain.");
			}

			const tokensBN = ethers.utils.parseEther(
				String(getValues().tokens_to_crowdsale).trim()
			);

			const tokenContract = new ethers.Contract(
				token?.token_address,
				tokenAbi,
				signer
			);

			try {
				await tokenContract.estimateGas.transfer(activeCrowdsaleAddress, tokensBN);
				console.log("Gas estimation succeeded, proceeding to transfer");
			} catch (err) {
				console.error("Gas estimation failed:", err);
				throw new Error(
					"Cannot transfer tokens: gas estimation failed. Make sure the contract is ready."
				);
			}

			showLoadingToast(toastId, t("Transferring tokens to crowdsale..."));
			const tx = await tokenContract.transfer(activeCrowdsaleAddress, tokensBN);
			await tx.wait();
			updateSuccessToast(toastId, t("tokens_transferred"));

			await updateTokenInfo(getValues().symbol, {
				transfered_to_crowdsale: true,
			});
			setTransferDisabled(true);
			setTransferDone(true);
			router.push("/provisioning");
		} catch (error) {
			console.error("Transfer failed:", error);
			updateErrorToast(toastId, error.message || "Transfer failed");
			setTransferDisabled(false);
		} finally {
			setLoading(false);
		}
	};

	const finalizeCrowdsale = async () => {
		const signer = await ethers5Adapter.signer.toEthers({
			client,
			chain,
			account,
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

			updateSuccessToast(toastId, t("crowdsale_finalized"));

			const tokenContract = new ethers.Contract(
				token?.token_address,
				tokenAbi,
				signer
			);

			const walletAddress = await signer.getAddress();
			const walletBalance = await tokenContract.balanceOf(walletAddress);
			const totalTokens = ethers.utils.formatEther(walletBalance);

			await updateTokenInfo(token?.symbol, {
				cap: totalTokens,
				transfered_to_crowdsale: false,
				crowdsale_address: "",
				crowdsale_finalized: true,
			});

			setToken((prev) => ({
				...prev,
				cap: totalTokens,
				crowdsale_address: "",
				transfered_to_crowdsale: false,
			}));
			setTransferDisabled(true);
			setDisableDeploy(false);
			router.push(`/provisioning`);
		} catch (error) {
			console.error("Finalize failed:", error);
			updateErrorToast(toastId, error.message || t("finalize_failed"));
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
			if (!v.tokens_to_crowdsale || isNaN(v.tokens_to_crowdsale)) {
				throw new Error("Invalid number of tokens to transfer");
			}

			const provider = ethers5Adapter.provider.toEthers({
				client: client,
				chain: chain,
				account: account,
			});

			const existingTokenAddress = token?.token_address || tokenAddress;
			let deployedToken = token;

			if (existingTokenAddress) {
				showLoadingToast(toastId, "Token already deployed. Resuming crowdsale deployment...");
				deployedToken = {
					...token,
					address: existingTokenAddress,
					token_address: existingTokenAddress,
				};
				setTokenAddress(existingTokenAddress);
			} else {
				// Deploy token
				deployedToken = await deployToken(toastId);
				setTokenAddress(deployedToken.address);
			}

			// Confirm token deployment
			showLoadingToast(toastId, t("Wait please..."));

			while (true) {
				const code = await provider.getCode(deployedToken.address || deployedToken.token_address);
				if (code !== "0x") break;
				await new Promise((res) => setTimeout(res, 4000));
			}

			// Deploy crowdsale
			const crowdsale = await deployCrowdsale(deployedToken, toastId);
			setCrowdsaleAddress(crowdsale.address);

			// Confirm crowdsale deployment
			showLoadingToast(toastId, t("Wait please..."));

			while (true) {
				const code = await provider.getCode(crowdsale.address);
				if (code !== "0x") break;
				await new Promise((res) => setTimeout(res, 4000));
			}

			updateSuccessToast(toastId, t("deploy_complete"));

			setDisableDeploy(true);
			setTransferDisabled(false);
			setDeploymentComplete(true);
		} catch (error) {
			console.log(error);
			updateErrorToast(toastId, error.message || "Deployment failed");
		} finally {
			setLoading(false);
		}
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

	return {
		deployToken,
		deployCrowdsale,
		finalizeAndRenewCrowdsale,
		transferTokensToCrowdsale,
		finalizeCrowdsale,
		loading,
		token,
		tokenAddress,
		crowdsaleAddress,
		setLoading,
		account,
		handleDeployAll,
		deploymentComplete,
		setSelectedWinery,
		selectedWinery,
		updateCrowdsale,
	};
};

export default useDeployment;
