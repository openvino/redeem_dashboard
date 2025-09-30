import { useState, useEffect, useMemo, useCallback } from "react";
import { OVT_ABI } from "../../contracts";
import {
	getPrice,
	tokenDataInspector,
	calculateHoldersDetail,
	fetchTransferEventsWithMetadata,
	fetchPairPriceHistory,
	computeTokensSoldBetween,
	computeTokensSoldForYear,
} from "@/utils/getTokenInformation";
import { ETH_DAI_PAIR } from "../../contracts";
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

	const [holdersDetail, setHoldersDetail] = useState([]);
	const [transferEvents, setTransferEvents] = useState([]);
	const [priceHistory, setPriceHistory] = useState([]);

	useEffect(() => {
		if (!contractAddress) return;
		let isActive = true;
		const providerUri = process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL;

		const provider = new ethers.providers.JsonRpcProvider(providerUri);
		const contract = new ethers.Contract(contractAddress, OVT_ABI, provider);
		const fetchData = async () => {
    try {
      setLoading(true);
      const baseData = await tokenDataInspector(contract, contractAddress);
      const knownAddresses = {
        crowdsaleAddress: baseData.crowdsaleAddress,
        lpContractAddress: baseData.lpContractAddress,
        contractPairAddress,
        tokenContract: contractAddress,
      };

      const [events, price, history] = await Promise.all([
        fetchTransferEventsWithMetadata(contract, provider).catch((err) => {
          console.error('No se pudieron obtener los eventos', err);
          return [];
        }),
        contractPairAddress
          ? getPrice(contractPairAddress, ETH_DAI_PAIR, provider).catch((err) => {
              console.error('No se pudo obtener el precio del par', err);
              return -1;
            })
          : Promise.resolve(-1),
        contractPairAddress
          ? fetchPairPriceHistory(provider, contractPairAddress, contractAddress).catch(
              (err) => {
                console.error('No se pudo obtener el histórico de precios', err);
                return [];
              }
            )
          : Promise.resolve([]),
      ]);

      const detailedHolders = await calculateHoldersDetail(
        contract,
        knownAddresses,
        events
      ).catch((err) => {
        console.error('No se pudo calcular el detalle de holders', err);
        return [];
      });

      if (!isActive) return;

      setTokenInfo((prev) => ({
        ...prev,
        ...baseData,
        price,
        holdersCount: detailedHolders.length,
        totalTransfers: events.length,
      }));

      setTransferEvents(events);
      setHoldersDetail(detailedHolders);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error al cargar información del token', error);
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
		};

		fetchData();

		return () => {
			isActive = false;
		};
	}, [contractAddress, contractPairAddress]);

	const knownAddresses = useMemo(
		() => ({
			crowdsaleAddress: tokenInfo.crowdsaleAddress,
			lpContractAddress: tokenInfo.lpContractAddress,
			contractPairAddress,
			tokenContract: contractAddress,
		}),
		[
			tokenInfo.crowdsaleAddress,
			tokenInfo.lpContractAddress,
			contractPairAddress,
			contractAddress,
		]
	);

	const getTokensSoldBetweenDates = useCallback(
		(startDate, endDate) => {
			if (!startDate || !endDate) return 0;
			return computeTokensSoldBetween(
				transferEvents,
				tokenInfo.crowdsaleAddress,
				startDate,
				endDate
			);
		},
		[transferEvents, tokenInfo.crowdsaleAddress]
	);

	const getTokensSoldForYear = useCallback(
		(year) =>
			computeTokensSoldForYear(
				transferEvents,
				tokenInfo.crowdsaleAddress,
				year
			),
		[transferEvents, tokenInfo.crowdsaleAddress]
	);

	const tokensSoldDuringVco = useCallback(() => {
		if (!tokenInfo.vcoStartDate || !tokenInfo.vcoEndDate) return 0;
		return computeTokensSoldBetween(
			transferEvents,
			tokenInfo.crowdsaleAddress,
			new Date(tokenInfo.vcoStartDate),
			new Date(tokenInfo.vcoEndDate)
		);
	}, [transferEvents, tokenInfo.crowdsaleAddress, tokenInfo.vcoStartDate, tokenInfo.vcoEndDate]);

	return {
		tokenInfo,
		loading,
		holdersDetail,
		transferEvents,
		priceHistory,
		getTokensSoldBetweenDates,
		getTokensSoldForYear,
		tokensSoldDuringVco,
		knownAddresses,
	};
};

export default useTokenInformation;
