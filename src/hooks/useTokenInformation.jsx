import { useState, useEffect } from "react";
import { OVT_ABI } from "../../contracts";
import {
	getPrice,
	tokenDataInspector,
	calculateHoldersCount,
} from "@/utils/getTokenInformation";
import { ETH_DAI_PAIR, MTB19_ETH_PAIR } from "../../contracts";
import { ethers } from "ethers";

const useTokenInformation = (contractAddress, contractPairAddress) => {
	const [loading, setLoading] = useState(false);

	const [tokenInfo, setTokenInfo] = useState({
		name: "",
		symbol: "",
		totalSupply: 0,
		burnedTokens: 0,
		holdersCount: -1,
		totalTransfers: -1,
		tokenContract: "",
		crowdsaleContract: "",
		lpContract: "",
		vcoStartDate: "",
		vcoEndDate: "",
		vcoPrice: 0,
		vcoPriceFiat: "",
		adminAddress: "",
		price: -1,
		initialLpTokenDeposit: 0,
	});

	useEffect(() => {
		const providerUri = process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL;

		const provider = new ethers.providers.JsonRpcProvider(providerUri);
		const contract = new ethers.Contract(contractAddress, OVT_ABI, provider);
		const fetchData = async () => {
			try {
				const fetchTokenDataPromise = (async () => {
					const data = await tokenDataInspector(contract, contractAddress);

					const {
						address,
						name,
						symbol,
						totalSupply,
						vcoIssuance,
						balance,
						burnedTokensDrunk,
						crowdsaleAddress,
						uniswapUri,
						lpContractAddress,
					} = data;

					setTokenInfo((prev) => ({
						...prev,
						vcoIssuance,
						name,
						symbol,
						balance,
						totalSupply,
						burnedTokens: burnedTokensDrunk,
						tokenContract: address,
						crowdsaleAddress,
						uniswapUri,
						lpContractAddress,
						// lpContract: '',
						// vcoStartDate: '',
						// vcoEndDate: '',
						// vcoPrice: 0,
						// vcoPriceFiat: '',
						// adminAddress: '',
						// initialLpTokenDeposit: 0,
					}));
				})();

				const fetchPricePromise = (async () => {
					const price = await getPrice(MTB19_ETH_PAIR, ETH_DAI_PAIR);

					setTokenInfo((prev) => ({
						...prev,
						price,
					}));
				})();

				const calculateHoldersCountPromise = (async () => {
					const { holdersCount, transferEventsCount } =
						await calculateHoldersCount(contract);
					setTokenInfo((prev) => ({
						...prev,
						holdersCount,
						totalTransfers: transferEventsCount,
					}));
				})();

				const promises = [
					fetchTokenDataPromise,
					fetchPricePromise,
					calculateHoldersCountPromise,
				];

				setLoading(true);

				Promise.all(promises)
					.catch((error) => {
						console.error("Error al obtener datos del token:", error);
					})
					.finally(() => {
						setLoading(false);
					});
			} catch (error) {
				console.log(error.message);
			}
		};

		fetchData();
	}, [contractAddress]);

	return { tokenInfo, loading };
};

export default useTokenInformation;
