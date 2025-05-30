import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import HomeLayout from "@/components/HomeLayout";
import useAdmins from "@/hooks/useAdmins";
import useWineries from "@/hooks/useWineries";
import useProfile from "@/hooks/useProfile";
import MTBArtifact from "../../../contracts/artifacts/MTB.json";
import CrowdsaleArtifact from "../../../contracts/artifacts/Crowdsale.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

	// --- Inject constructor fragment so ethers knows constructor signature ---
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
	const tokenAbi = [tokenConstructorFragment, ...MTBArtifact.abi];
	const tokenBytecode =
		MTBArtifact.data?.bytecode?.object ?? MTBArtifact.bytecode;

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
	const crowdAbi = [crowdConstructorFragment, ...CrowdsaleArtifact.abi];
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
		const toastId = toast("Deploying token & crowdsale…", {
			position: "top-right",
			autoClose: false,
			isLoading: true,
			theme: "dark",
		});

		try {
			if (!account) throw new Error("Connect your wallet first");

			const v = getValues();
			// Token params
			const name = v.name?.trim();
			const symbol = v.symbol?.trim();
			const capInput = String(v.cap || "").trim();
			if (!name || !symbol || !capInput || isNaN(Number(capInput)))
				throw new Error("Token name, symbol and cap required");
			const capBN = ethers.utils.parseEther(capInput);

			// Crowdsale params
			const rate = Number(String(v.rate || "").trim());
			const openingTs = Math.floor(new Date(v.openingTime).getTime() / 1000);
			const closingTs = Math.floor(new Date(v.closingTime).getTime() / 1000);
			const tokensBN = ethers.utils.parseEther(
				String(v.tokensToCrowdsale || "").trim()
			);
			if (rate <= 0 || !v.openingTime || !v.closingTime || tokensBN.lte(0))
				throw new Error("Fill all crowdsale fields correctly");
			if (openingTs >= closingTs) throw new Error("Opening ≥ closing");
			if (tokensBN.gt(capBN)) throw new Error("Crowd tokens exceed supply");

			const weiCapBN = tokensBN.div(rate);
			if (weiCapBN.isZero()) throw new Error("Rate too high for tokens");

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			// Deploy Token
			const tokenFactory = new ethers.ContractFactory(
				tokenAbi,
				tokenBytecode,
				signer
			);
			const token = await tokenFactory.deploy(name, symbol, capBN, capBN);
			await token.deployed();

			// Deploy Crowdsale
			const crowdFactory = new ethers.ContractFactory(
				crowdAbi,
				crowdBytecode,
				signer
			);
			const crowdsale = await crowdFactory.deploy(
				account.address,
				token.address,
				weiCapBN,
				openingTs,
				closingTs,
				rate
			);
			await crowdsale.deployed();

			// Fund Crowdsale
			await (await token.transfer(crowdsale.address, tokensBN)).wait();

			toast.update(toastId, {
				isLoading: false,
				type: toast.TYPE.SUCCESS,
				render: `✅ Token: ${token.address}\n✅ Crowdsale: ${crowdsale.address}`,
				autoClose: 8000,
			});
		} catch (err) {
			console.error("DEPLOY ERROR", err);
			toast.update(toastId, {
				isLoading: false,
				type: toast.TYPE.ERROR,
				render: err.message,
				autoClose: 6000,
			});
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
					{/* Token */}
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

					{/* Crowdsale */}
					<h2 className="text-xl font-semibold">{t("crowdsale_config")}</h2>
					<div className="grid lg:grid-cols-2 gap-4">
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
							{t("deploy_contracts")}
						</button>
					</div>
				</form>
			</div>
		</HomeLayout>
	);
};

export default Launch;
