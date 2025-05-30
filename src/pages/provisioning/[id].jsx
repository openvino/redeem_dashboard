import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAdmins from "@/hooks/useAdmins";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useProfile from "@/hooks/useProfile";
import useWineries from "@/hooks/useWineries";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientAxios from "@/config/clientAxios";
import HomeLayout from "@/components/HomeLayout";
import { useActiveAccount } from "thirdweb/react";
import rawMTB from "../../../contracts/artifacts/MTB.json";
import { ethers } from "ethers";

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

	// ABI del constructor
	const constructorFragment = {
		type: "constructor",
		stateMutability: "nonpayable",
		inputs: [
			{ internalType: "string", name: "name", type: "string" },
			{ internalType: "string", name: "symbol", type: "string" },
			{ internalType: "uint256", name: "cap", type: "uint256" },
			{ internalType: "uint256", name: "initialMintAmount", type: "uint256" },
		],
	};
	const abi = [constructorFragment, ...rawMTB.abi];
	const bytecode = rawMTB.data.bytecode.object;

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
	}, [admins]);

	const handleDeployToken = async () => {
		const toastId = toast("Deploying token...", {
			position: "top-right",
			autoClose: false,
			isLoading: true,
			theme: "dark",
		});

		try {
			if (!account) throw new Error("No wallet detected");

			const { name: _n, symbol: _s, cap: _c } = getValues();
			const name = _n?.trim(),
				symbol = _s?.trim(),
				capInput = String(_c ?? "").trim();

			if (!name || !symbol || !capInput || isNaN(Number(capInput))) {
				throw new Error("Missing or invalid fields");
			}

			const cap = ethers.utils.parseEther(capInput);

			console.log("Deploying with:", { name, symbol, cap: cap.toString() });
			console.log("Bytecode sample:", bytecode.slice(0, 10));

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			const factory = new ethers.ContractFactory(abi, bytecode, signer);
			const contract = await factory.deploy(name, symbol, cap, cap);
			await contract.deployed();
			console.log(`Token deployed at ${contract.address}`);

			toast.update(toastId, {
				isLoading: false,
				type: toast.TYPE.SUCCESS,
				render: `Token deployed at ${contract.address}`,
				autoClose: 6000,
			});
		} catch (err) {
			console.error("DEPLOY ERROR", err);
			toast.update(toastId, {
				isLoading: false,
				type: toast.TYPE.ERROR,
				render: `Error: ${err.message}`,
				autoClose: 6000,
			});
		}
	};

	return (
		<HomeLayout>
			<ToastContainer />
			<div className="z-1 w-full overflow-x-scroll lg:overflow-x-hidden">
				<h1 className="text-2xl font-bold text-center mb-4">{t("launch")}</h1>

				<form
					className="p-2 space-y-2 flex flex-col bg-[#F1EDE2] w-[99%] rounded-xl border-2 border-gray-200"
					onSubmit={handleSubmit(() => {})}
				>
					{account?.address && (
						<div className="flex items-center justify-center">
							<label className="w-24 font-bold">{t("deployer")}</label>
							<p>{account.address}</p>
						</div>
					)}

					<div className="flex flex-col lg:flex-row justify-center gap-4">
						<div className="flex items-center">
							<label className="w-24 font-bold">{t("token_name")}:</label>
							<input
								required
								{...register("name")}
								className="w-64 px-2 py-1 border rounded-md"
							/>
						</div>
						<div className="flex items-center">
							<label className="w-24 font-bold">{t("token_symbol")}:</label>
							<input
								required
								{...register("symbol")}
								className="w-64 px-2 py-1 border rounded-md"
							/>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row justify-center gap-4">
						<div className="flex items-center">
							<label className="w-24 font-bold">{t("token_cap")}:</label>
							<input
								required
								type="number"
								step="any"
								{...register("cap")}
								className="w-64 px-2 py-1 border rounded-md"
							/>
						</div>
						<div className="flex items-center">
							<label className="w-24 font-bold">{t("token_image")}:</label>
							<input
								required
								{...register("image")}
								className="w-64 px-2 py-1 border rounded-md"
							/>
						</div>
					</div>

					<div className="flex justify-center mt-4">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-4 py-2 bg-gray-300 rounded-md"
						>
							{t("volver")}
						</button>
						<button
							type="button"
							onClick={handleDeployToken}
							className="px-4 py-2 ml-4 bg-green-700 text-white rounded-md"
						>
							{t("deploy_contract")}
						</button>
					</div>
				</form>
			</div>
		</HomeLayout>
	);
};

export default Launch;
