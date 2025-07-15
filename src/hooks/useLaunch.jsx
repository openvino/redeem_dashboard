import React, { useEffect, useState } from "react";
import OpenvinoTokenArtifact from "../../contracts/artifacts/OVT.json";
import { useForm } from "react-hook-form";
import { useActiveAccount } from "thirdweb/react";
import { useTranslation } from "react-i18next";
import {
	tokenLaunching,
	tokensLaunching,
	tokensLaunchingAll,
} from "@/utils/provisioningUtils";
import { isAdminUser } from "@/utils/authUtils";
import { openvinoApiKey } from "@/config";
import clientAxios from "@/config/clientAxios";
import { useSession } from "next-auth/react";
const useLaunch = (id) => {
	const session = useSession();
	const [token, setToken] = useState({});
	const [loading, setLoading] = useState(false);
	const [tokenAddress, setTokenAddress] = useState("");
	const [crowdsaleAddress, setCrowdsaleAddress] = useState("");
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
			winery_id: "",
			token_address: "",
			crowdsale_address: "",
		},
	});

	const [wineries, setWineries] = useState([]);
	const [selectedWinery, setSelectedWinery] = useState("");

	useEffect(() => {
		const fetchWineries = async () => {
			try {
				const response = await clientAxios.get("/winarysRoute", {
					params: {
						is_admin: isAdminUser(session),
					},
					headers: { "x-api-key": openvinoApiKey },
				});

				const wineries = response.data.map((winery) => winery.id);

				setWineries(wineries);
			} catch (err) {
				console.error("Error fetching wineries:", err);
			}
		};
		fetchWineries();
	}, [session, setValue]);

	useEffect(() => {
		console.log(id);
		const fetchTokens = async () => {
			console.log(isAdminUser(session));

			if (id) {
				const token = await tokenLaunching(id);
				setSelectedWinery(token.winery_id);
				console.log(token);
				setToken(token);
			}
		};
		fetchTokens();
	}, []);
	const account = useActiveAccount();
	const { t } = useTranslation();
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
	return {
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
		wineries,
		selectedWinery,
		setSelectedWinery,
		session,
	};
};

export default useLaunch;
