import { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { OVT_ABI, NETWORK_CONFIG, contracts } from "../../contracts";
import {
	getPrice,
	tokenDataInspector,
	calculateHoldersDetail,
	fetchTransferEventsWithMetadata,
	fetchPairPriceHistory,
	computeTokensSoldBetween,
	computeTokensSoldForYear,
} from "@/utils/getTokenInformation";

const ENV_VALUES = {
	NEXT_PUBLIC_BASE_PROVIDER_URL: process.env.NEXT_PUBLIC_BASE_PROVIDER_URL,
	NEXT_PUBLIC_ETHEREUM_PROVIDER_URL:
		process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL,
	NEXT_PUBLIC_ETHEREUM_MAINNET_PROVIDER_URL:
		process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_PROVIDER_URL,
};

const normalizeNetwork = (networkKey) =>
	networkKey && NETWORK_CONFIG[networkKey]
		? networkKey
		: NETWORK_CONFIG.base.key;

const resolveProviderUri = (networkKey) => {
	const config = NETWORK_CONFIG[networkKey] ?? NETWORK_CONFIG.base;
	for (const envVar of config.providerEnvVars ?? []) {
		const value = ENV_VALUES[envVar];
		if (value) {
			return value;
		}
	}
	return null;
};

const ENABLE_ONCHAIN_STATS =
	process.env.NEXT_PUBLIC_ENABLE_ONCHAIN_STATS === "true";

const ZERO_ADDRESS = ethers.constants.AddressZero;

const useTokenInformation = (contractMeta) => {
	const contractAddress = contractMeta?.contractAddress ?? "";
	const contractPairAddress = contractMeta?.contractPairAddress ?? "";
	const configuredNetwork = normalizeNetwork(contractMeta?.network);
	const archivedFlag = Boolean(contractMeta?.archived);

	const [loading, setLoading] = useState(false);

	const [tokenInfo, setTokenInfo] = useState({
		name: "",
		symbol: "",
		totalSupply: 0,
		burnedTokens: 0,
		holdersCount: -1,
		totalTransfers: -1,
		tokenContract: "",
		crowdsaleAddress: "",
		lpContractAddress: "",
		vcoStartDate: "",
		vcoEndDate: "",
		vcoPrice: 0,
		vcoPriceFiat: "",
		adminAddress: "",
		price: -1,
		initialLpTokenDeposit: 0,
		displayName: "",
		network: configuredNetwork,
		networkLabel: NETWORK_CONFIG[configuredNetwork]?.label ?? configuredNetwork,
		archived: archivedFlag,
		priceReferencePair: null,
		legacyAddress: contractMeta?.legacyAddress ?? null,
		tokensToBurn: null,
		legacyBurned: null,
		vcoSourceNetwork: null,
		vcoSourceNetworkLabel: null,
	});

	const [holdersDetail, setHoldersDetail] = useState([]);
	const [transferEvents, setTransferEvents] = useState([]);
	const [priceHistory, setPriceHistory] = useState([]);

	useEffect(() => {
		if (!contractAddress) return;
		let isActive = true;

		const networkKey = normalizeNetwork(contractMeta?.network);
		const providerUri = resolveProviderUri(networkKey);

		if (!providerUri) {
			console.error(`No provider configured for network ${networkKey}`);
			return () => {
				isActive = false;
			};
		}

		setTokenInfo((prev) => ({
			...prev,
			tokenContract: contractAddress,
			network: networkKey,
			networkLabel: NETWORK_CONFIG[networkKey]?.label ?? networkKey,
			archived: archivedFlag,
			displayName: contractMeta?.displayName || prev.displayName || prev.name,
		}));

		const provider = new ethers.providers.JsonRpcProvider(providerUri);
		const contract = new ethers.Contract(contractAddress, OVT_ABI, provider);

		const fetchData = async () => {
			try {
				setLoading(true);
				const baseData = await tokenDataInspector(contract, contractAddress);
				console.log("baseData", baseData);

				const effectiveNetwork = normalizeNetwork(
					baseData.network || networkKey
				);
				const priceReferencePair = contractPairAddress
					? baseData.priceReferencePair ||
					  contractMeta?.priceReferencePair ||
					  NETWORK_CONFIG[effectiveNetwork]?.referencePair ||
					  null
					: null;

				const knownAddresses = {
					crowdsaleAddress: baseData.crowdsaleAddress,
					lpContractAddress: baseData.lpContractAddress,
					contractPairAddress,
					tokenContract: contractAddress,
				};

				const startBlock = baseData.startBlock ?? contractMeta?.startBlock ?? 0;
				const shouldFetchOnchain = ENABLE_ONCHAIN_STATS;

				const eventsPromise = shouldFetchOnchain
					? fetchTransferEventsWithMetadata(contract, provider, {
							startBlock,
							chunkSize: 7500,
					  }).catch((err) => {
							console.error("No se pudieron obtener los eventos", err);
							return [];
					  })
					: Promise.resolve([]);

				const pricePromise =
					shouldFetchOnchain && contractPairAddress && priceReferencePair
						? getPrice(contractPairAddress, priceReferencePair, provider).catch(
								(err) => {
									console.error("No se pudo obtener el precio del par", err);
									return -1;
								}
						  )
						: Promise.resolve(-1);

				const historyPromise =
					shouldFetchOnchain && contractPairAddress
						? fetchPairPriceHistory(
								provider,
								contractPairAddress,
								contractAddress
						  ).catch((err) => {
								console.error(
									"No se pudo obtener el histórico de precios",
									err
								);
								return [];
						  })
						: Promise.resolve([]);

				const burnedCurrentPromise = contract
					.balanceOf(ZERO_ADDRESS)
					.then((balanceWei) =>
						parseFloat(ethers.utils.formatEther(balanceWei))
					)
					.catch((err) => {
						console.error(
							"No se pudo obtener el balance del address cero",
							err
						);
						return null;
					});

				let legacyBurnPromise = Promise.resolve(null);
				if (contractMeta?.legacyAddress) {
					const legacyMeta = contracts.find(
						(entry) =>
							entry.contractAddress.toLowerCase() ===
							contractMeta.legacyAddress.toLowerCase()
					);
					const legacyNetworkKey = normalizeNetwork(
						legacyMeta?.network || NETWORK_CONFIG.ethereum.key
					);
					const legacyProviderUri = resolveProviderUri(legacyNetworkKey);
					if (legacyProviderUri) {
						const legacyProvider = new ethers.providers.JsonRpcProvider(
							legacyProviderUri
						);
						const legacyContract = new ethers.Contract(
							contractMeta.legacyAddress,
							OVT_ABI,
							legacyProvider
						);
						legacyBurnPromise = legacyContract
							.balanceOf(ZERO_ADDRESS)
							.then((balanceWei) =>
								parseFloat(ethers.utils.formatEther(balanceWei))
							)
							.catch((err) => {
								console.error(
									"No se pudo obtener el balance del address cero (legacy)",
									err
								);
								return null;
							});
					}
				}

				const [events, price, history, burnedCurrent, legacyBurned] =
					await Promise.all([
						eventsPromise,
						pricePromise,
						historyPromise,
						burnedCurrentPromise,
						legacyBurnPromise,
					]);

				const detailedHolders = shouldFetchOnchain
					? await calculateHoldersDetail(
							contract,
							knownAddresses,
							events
					  ).catch((err) => {
							console.error("No se pudo calcular el detalle de holders", err);
							return [];
					  })
					: [];

				if (!isActive) return;

				setTokenInfo((prev) => {
					const burnedFromSupply = (() => {
						const issuance = baseData.vcoIssuance ?? prev.vcoIssuance;
						const supply = baseData.totalSupply ?? prev.totalSupply;
						if (issuance == null || supply == null) return null;
						const diff = Number(issuance) - Number(supply);
						return Number.isFinite(diff) ? Math.max(diff, 0) : null;
					})();

					const burnedOnChainValue =
						burnedCurrent !== null && burnedCurrent !== undefined
							? burnedCurrent
							: baseData.burnedTokens ?? prev.burnedTokens ?? null;
					const burnedOnChainNumeric =
						burnedOnChainValue !== null && burnedOnChainValue !== undefined
							? Number(burnedOnChainValue)
							: null;

					const burnedBaseline = (() => {
						if (burnedFromSupply !== null && burnedFromSupply !== undefined) {
							return Number(burnedFromSupply);
						}
						if (
							burnedOnChainNumeric !== null &&
							burnedOnChainNumeric !== undefined
						) {
							return burnedOnChainNumeric;
						}
						const fallback = baseData.burnedTokens ?? prev.burnedTokens;
						return fallback != null ? Number(fallback) : 0;
					})();

					const metadataLegacyBurned =
						baseData.legacyBurned ?? prev.legacyBurned ?? null;
					let effectiveLegacyBurned =
						legacyBurned !== null && legacyBurned !== undefined
							? legacyBurned
							: metadataLegacyBurned;

					if (
						effectiveLegacyBurned === 0 &&
						metadataLegacyBurned !== null &&
						metadataLegacyBurned !== undefined &&
						metadataLegacyBurned > 0
					) {
						effectiveLegacyBurned = metadataLegacyBurned;
					}

					const tokensToBurnValue =
						effectiveLegacyBurned !== null &&
						effectiveLegacyBurned !== undefined
							? Math.max(effectiveLegacyBurned - (burnedOnChainNumeric || 0), 0)
							: baseData.tokensToBurn ?? prev.tokensToBurn;

			const normalizedTokensToBurn =
				tokensToBurnValue !== null && tokensToBurnValue !== undefined
					? Number(tokensToBurnValue)
					: tokensToBurnValue;

			const burnedTokensValue = (() => {
				const baseline =
					burnedBaseline === null || burnedBaseline === undefined
						? burnedOnChainNumeric ?? 0
						: Number(burnedBaseline);
				if (!archivedFlag) {
					const pending = Number(normalizedTokensToBurn ?? 0);
					if (pending > 0 && Number.isFinite(baseline)) {
						const floor = burnedOnChainNumeric ?? 0;
						const adjusted = baseline - pending;
						if (Number.isFinite(adjusted)) {
							return Math.max(adjusted, floor, 0);
						}
					}
				}
				return baseline;
			})();

					return {
						...prev,
						...baseData,
						price,
						holdersCount: detailedHolders.length,
						totalTransfers: events.length,
						network: effectiveNetwork,
						networkLabel:
							NETWORK_CONFIG[effectiveNetwork]?.label ?? effectiveNetwork,
						archived: baseData.archived ?? archivedFlag,
						displayName:
							baseData.displayName ||
							contractMeta?.displayName ||
							baseData.name ||
							prev.displayName,
						priceReferencePair,
						burnedTokens: burnedTokensValue,
						tokensToBurn: normalizedTokensToBurn,
						legacyBurned:
							effectiveLegacyBurned !== null &&
							effectiveLegacyBurned !== undefined
								? effectiveLegacyBurned
								: baseData.legacyBurned ?? prev.legacyBurned,
						vcoSourceNetwork:
							baseData.vcoSourceNetwork ??
							prev.vcoSourceNetwork ??
							effectiveNetwork,
						vcoSourceNetworkLabel:
							baseData.vcoSourceNetworkLabel ??
							prev.vcoSourceNetworkLabel ??
							NETWORK_CONFIG[effectiveNetwork]?.label ??
							effectiveNetwork,
					};
				});

				setTransferEvents(events);
				setHoldersDetail(detailedHolders);
				setPriceHistory(history);
			} catch (error) {
				console.error("Error al cargar información del token", error);
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
	}, [contractAddress, contractPairAddress, contractMeta, archivedFlag]);

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
	}, [
		transferEvents,
		tokenInfo.crowdsaleAddress,
		tokenInfo.vcoStartDate,
		tokenInfo.vcoEndDate,
	]);

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
