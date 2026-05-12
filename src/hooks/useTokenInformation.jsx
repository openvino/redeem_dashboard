import { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { OVT_ABI, NETWORK_CONFIG, contracts } from "../../contracts";
import {
	tokenDataInspector,
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

const ZERO_ADDRESS = ethers.constants.AddressZero;
const OPENVINO_API_URL = process.env.NEXT_PUBLIC_OPENVINO_API_URL;

const OPENVINO_API_KEY = process.env.NEXT_PUBLIC_OPENVINO_API_KEY;

const mapNetworkToApiNetwork = (networkKey) => {
	if (!networkKey) return "base";
	const normalized = networkKey.toLowerCase();
	if (normalized === "ethereum") return "mainnet";
	if (normalized === "optimism") return "optimism";
	return normalized;
};

const toNumberOrNull = (input) => {
	if (input === null || input === undefined) return null;
	if (typeof input === "number") {
		return Number.isFinite(input) ? input : null;
	}
	if (typeof input === "string") {
		const normalized = Number(input.replace(/,/g, ""));
		return Number.isFinite(normalized) ? normalized : null;
	}
	return null;
};

const toTimestampMs = (input) => {
	if (input === null || input === undefined) return null;
	if (typeof input === "number") {
		if (!Number.isFinite(input)) return null;
		return input > 1e12 ? input : input * 1000;
	}
	if (typeof input === "string") {
		const parsed = Date.parse(input);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
};

const deriveTags = (address, knownAddresses = {}) => {
	if (!address) return [];
	const lower = address.toLowerCase();
	return Object.entries(knownAddresses)
		.filter(([, candidate]) => candidate && candidate.toLowerCase() === lower)
		.map(([label]) => label);
};

const deriveApiData = ({
	tokenHistory,
	pairHistory,
	knownAddresses,
	targetTokenAddress,
}) => {
	const normalizedToken = targetTokenAddress?.toLowerCase() ?? null;

	const holders =
		Array.isArray(tokenHistory?.holders) && tokenHistory.holders.length > 0
			? tokenHistory.holders
					.map((holder) => {
						const address =
							holder.address || holder.wallet || holder.holderAddress;
						const balance =
							toNumberOrNull(
								holder.balanceFormatted ??
									holder.balance ??
									holder.balanceRaw ??
									holder.amount
							) ?? 0;
						if (!address || balance <= 0) return null;
						return {
							address,
							balance,
							tags: deriveTags(address, knownAddresses),
						};
					})
					.filter(Boolean)
			: [];

	const events =
		Array.isArray(tokenHistory?.events) && tokenHistory.events.length > 0
			? tokenHistory.events
					.map((event) => {
						const value =
							toNumberOrNull(
								event.valueFormatted ??
									event.value ??
									event.amountFormatted ??
									event.amount
							) ?? 0;
						const timestamp =
							toTimestampMs(
								event.timestamp ??
									event.blockTimestamp ??
									event.isoDate ??
									event.date ??
									event.blockTimestampLast
							) ?? null;
						return {
							hash: event.transactionHash ?? event.hash ?? event.txHash ?? null,
							from: event.from ?? event.sender ?? null,
							to: event.to ?? event.recipient ?? event.receiver ?? null,
							value,
							blockNumber: event.blockNumber ?? event.block ?? null,
							timestamp,
						};
					})
					.filter(
						(event) =>
							(event.from || event.to) &&
							event.timestamp !== null &&
							Number.isFinite(event.value)
					)
			: [];

	const tokenSummary = tokenHistory?.summary ?? {};
	const tokenMeta = tokenHistory?.token ?? {};

	const holdersCount =
		toNumberOrNull(tokenMeta.holdersCount) ??
		toNumberOrNull(tokenSummary.holderCount) ??
		(holders.length > 0 ? holders.length : null);
	const totalTransfers =
		toNumberOrNull(tokenMeta.totalTransfers) ??
		toNumberOrNull(tokenSummary.transferCount) ??
		(events.length > 0 ? events.length : null);
	const totalSupply =
		toNumberOrNull(tokenMeta.totalSupplyFormatted ?? tokenMeta.totalSupply) ??
		null;

	const syncEvents = pairHistory?.events?.syncs ?? [];
	const reserveMapping = pairHistory?.pair?.reserveMapping ?? {};
	const token0Meta =
		pairHistory?.pair?.token0 ?? reserveMapping?.reserve0 ?? {};

	const computeReserve = (entry, key) =>
		toNumberOrNull(
			entry?.[`${key}Formatted`] ??
				entry?.[`${key}`] ??
				entry?.[`${key}Raw`] ??
				entry?.[`${key}Wei`]
		);

	const priceHistory =
		Array.isArray(syncEvents) && syncEvents.length > 0
			? syncEvents
					.map((sync) => {
						const reserve0 = computeReserve(sync, "reserve0");
						const reserve1 = computeReserve(sync, "reserve1");
						if (!reserve0 || !reserve1) return null;
						const timestamp =
							toTimestampMs(
								sync.timestamp ??
									sync.blockTimestamp ??
									sync.isoDate ??
									sync.date
							) ?? null;
						if (!timestamp) return null;
						let price = reserve1 / reserve0;
						const syncToken0 = sync.token0 ?? sync.reserve0Token;
						if (
							normalizedToken &&
							syncToken0?.address &&
							syncToken0.address?.toLowerCase() !== normalizedToken
						) {
							price = reserve0 / reserve1;
						}
						return Number.isFinite(price)
							? {
									timestamp,
									price,
							  }
							: null;
					})
					.filter(Boolean)
			: [];

	const currentReserves =
		pairHistory?.summary?.currentReserves ??
		pairHistory?.pair?.currentReserves ??
		null;

	let price = null;
	if (currentReserves) {
		const reserve0 = computeReserve(currentReserves, "reserve0");
		const reserve1 = computeReserve(currentReserves, "reserve1");
		if (reserve0 && reserve1) {
			const pairToken0 = token0Meta?.address?.toLowerCase();
			if (normalizedToken && pairToken0 && pairToken0 !== normalizedToken) {
				price = reserve0 / reserve1;
			} else {
				price = reserve1 / reserve0;
			}
			if (!Number.isFinite(price)) {
				price = null;
			}
		}
	}

	return {
		holders,
		events,
		priceHistory,
		price,
		holdersCount,
		totalTransfers,
		totalSupply,
		tokenSummary,
		tokenMeta,
	};
};

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
		bottlesStock: null,
		pendingRedeems: null,
		lastDataCid: null,
		reserveAddresses: null,
		historyRow: null,
	});

	const [holdersDetail, setHoldersDetail] = useState([]);
	const [transferEvents, setTransferEvents] = useState([]);
	const [priceHistory, setPriceHistory] = useState([]);
	const [tokenHistoryApiData, setTokenHistoryApiData] = useState(null);
	const [pairHistoryApiData, setPairHistoryApiData] = useState(null);

	const fetchTokenStockRow = useCallback(async (tokenSymbol, chainName) => {
		if (!tokenSymbol) return null;
		try {
			const res = await axios.get("/api/routes/tokensHistoryRoute", {
				params: { token: tokenSymbol, chain: chainName },
			});
			return Array.isArray(res.data) && res.data.length > 0
				? res.data[0]
				: null;
		} catch (error) {
			console.error("Failed to fetch token history row", error);
			return null;
		}
	}, []);

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

				const apiNetwork = mapNetworkToApiNetwork(networkKey);
				const sanitizedApiUrl = OPENVINO_API_URL.replace(/\/$/, "");
				const axiosHeaders = {
					"Content-Type": "application/json",
				};
				if (OPENVINO_API_KEY) {
					axiosHeaders["x-api-key"] = OPENVINO_API_KEY;
				}

				const axiosConfig = {
					headers: axiosHeaders,
				};

				const requestPayload = {
					network: apiNetwork,
					startBlock: contractMeta?.startBlock ?? 0,
					batchDelayMs: 1500,
					maxRetries: 8,
					blockscoutPageSize: 100,
					blockscoutDelayMs: 1200,
					verbose: true,
				};

				const normalizedTokenAddress = contractAddress?.toLowerCase();
				const normalizedPairAddress = contractPairAddress?.toLowerCase();

				const baseDataPromise = tokenDataInspector(contract, contractAddress);
				const tokenHistoryPromise =
					normalizedTokenAddress && OPENVINO_API_URL
						? axios
								.post(
									`${sanitizedApiUrl}/viniswap/tokens/${normalizedTokenAddress}/history`,
									requestPayload,
									axiosConfig
								)
								.then((response) => response.data)
								.catch((err) => {
									console.error(
										"No se pudo obtener el historial del token desde la API",
										err?.response?.data || err
									);
									return null;
								})
						: Promise.resolve(null);

				const pairHistoryPromise =
					normalizedPairAddress && OPENVINO_API_URL
						? axios
								.post(
									`${sanitizedApiUrl}/viniswap/pairs/${normalizedPairAddress}/history`,
									requestPayload,
									axiosConfig
								)
								.then((response) => response.data)
								.catch((err) => {
									console.error(
										"No se pudo obtener el historial del par desde la API",
										err?.response?.data || err
									);
									return null;
								})
						: Promise.resolve(null);

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

				const [
					baseData,
					burnedCurrent,
					legacyBurned,
					tokenHistory,
					pairHistory,
				] = await Promise.all([
					baseDataPromise,
					burnedCurrentPromise,
					legacyBurnPromise,
					tokenHistoryPromise,
					pairHistoryPromise,
				]);

				if (!isActive) return;

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

				const apiDerived = deriveApiData({
					tokenHistory,
					pairHistory,
					knownAddresses,
					targetTokenAddress: contractAddress,
				});

				const apiStartBlock =
					toNumberOrNull(tokenHistory?.range?.fromBlock) ??
					baseData.startBlock ??
					contractMeta?.startBlock ??
					0;

				const burnedFromSupply = (() => {
					const issuance = toNumberOrNull(baseData.vcoIssuance);
					const supplyOverride =
						apiDerived.totalSupply ?? baseData.totalSupply ?? null;
					if (issuance == null || supplyOverride == null) return null;
					const diff = Number(issuance) - Number(supplyOverride);
					return Number.isFinite(diff) ? Math.max(diff, 0) : null;
				})();

				const burnedOnChainValue =
					burnedCurrent !== null && burnedCurrent !== undefined
						? burnedCurrent
						: baseData.burnedTokens ?? tokenInfo.burnedTokens ?? null;

				const burnedOnChainNumeric =
					burnedOnChainValue !== null && burnedOnChainValue !== undefined
						? Number(burnedOnChainValue)
						: null;

				const metadataLegacyBurned =
					baseData.legacyBurned ?? tokenInfo.legacyBurned ?? null;

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
					effectiveLegacyBurned !== null && effectiveLegacyBurned !== undefined
						? Math.max(effectiveLegacyBurned - (burnedOnChainNumeric || 0), 0)
						: baseData.tokensToBurn ?? tokenInfo.tokensToBurn ?? null;

				const normalizedTokensToBurn =
					tokensToBurnValue !== null && tokensToBurnValue !== undefined
						? Number(tokensToBurnValue)
						: tokensToBurnValue;

				const burnedTokensValue =
					burnedFromSupply !== null && burnedFromSupply !== undefined
						? Number(burnedFromSupply)
						: burnedOnChainNumeric ?? 0;
				const stockRow = await fetchTokenStockRow(
					baseData?.symbol,
					baseData?.network
				);
				const {
					bottles_stock,
					pending_redeems,
					last_data_cid,
					reserve_addresses,
				} = stockRow ?? {};

				setTokenInfo((prev) => ({
					...prev,
					...baseData,
					totalSupply:
						apiDerived.totalSupply ?? baseData.totalSupply ?? prev.totalSupply,
					startBlock: apiStartBlock,
					price:
						apiDerived.price !== null && apiDerived.price !== undefined
							? apiDerived.price
							: prev.price ?? -1,
					holdersCount:
						apiDerived.holdersCount ??
						apiDerived.holders.length ??
						prev.holdersCount,
					totalTransfers:
						apiDerived.totalTransfers ??
						apiDerived.events.length ??
						prev.totalTransfers,
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
					bottlesStock: bottles_stock,
					pendingRedeems: pending_redeems,
					lastDataCid: last_data_cid,
					reserveAddresses: reserve_addresses ?? null,
					historyRow: stockRow,
				}));

				setTransferEvents(apiDerived.events);
				setHoldersDetail(apiDerived.holders);
				setPriceHistory(apiDerived.priceHistory);
				setTokenHistoryApiData(tokenHistory);
				setPairHistoryApiData(pairHistory);

				console.log("Historial de token (API)", tokenHistory);
				console.log("Historial de par (API)", pairHistory);
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
	}, [
		contractAddress,
		contractPairAddress,
		contractMeta,
		archivedFlag,
		fetchTokenStockRow,
	]);

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

	const tokenSymbol = tokenInfo?.symbol;
	const tokenNetwork = tokenInfo?.network;

	const refreshTokenHistory = useCallback(async () => {
		if (!tokenSymbol) return null;
		const row = await fetchTokenStockRow(tokenSymbol, tokenNetwork);
		setTokenInfo((prev) => {
			if (!row) {
				return {
					...prev,
					historyRow: row,
				};
			}
			return {
				...prev,
				bottlesStock: row.bottles_stock ?? prev.bottlesStock,
				pendingRedeems: row.pending_redeems ?? prev.pendingRedeems,
				lastDataCid: row.last_data_cid ?? prev.lastDataCid,
				reserveAddresses: row.reserve_addresses ?? prev.reserveAddresses,
				historyRow: row,
			};
		});
		return row;
	}, [fetchTokenStockRow, tokenSymbol, tokenNetwork]);

	return {
		tokenInfo,
		loading,
		holdersDetail,
		transferEvents,
		priceHistory,
		tokenHistoryApiData,
		pairHistoryApiData,
		getTokensSoldBetweenDates,
		getTokensSoldForYear,
		tokensSoldDuringVco,
		knownAddresses,
		refreshTokenHistory,
	};
};

export default useTokenInformation;
