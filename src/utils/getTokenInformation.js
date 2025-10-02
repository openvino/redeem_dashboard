import { contracts, VCOPrices, NETWORK_CONFIG } from "../../contracts";

import { ethers } from "ethers";

const ADDRESS_ZERO = ethers.constants.AddressZero;

const pairAbi = [
	"function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
	"function token0() view returns (address)",
	"function token1() view returns (address)",
	"event Sync(uint112 reserve0, uint112 reserve1)",
];

const erc20Abi = ["function decimals() view returns (uint8)"];

const SAFE_SYNC_LIMIT = 150;

const ensureFiniteNumber = (value) => {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) return null;
	if (Number.isNaN(numericValue)) return null;
	return numericValue;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BLOCK_BATCH_SIZE = 40;
const BLOCK_BATCH_DELAY_MS = 150;

const extractTransferAmount = (event) => {
	const raw =
		event?.args?.value ??
		event?.args?.amount ??
		event?.args?.[2] ??
		event?.args?.["2"];
	if (!raw) {
		return null;
	}
	try {
		return ethers.utils.formatEther(raw);
	} catch (error) {
		console.error("No se pudo formatear el monto del evento", error, {
			event,
			raw,
		});
		return null;
	}
};

const eventsCache = new Map();
const blockCache = new Map();

const getCacheKey = (address) => address?.toLowerCase() ?? "";

const fetchLogsInChunks = async (
	provider,
	filter,
	fromBlock,
	toBlock,
	chunkSize = 20000,
	retries = 3,
	delayMs = 100
) => {
	const logs = [];
	for (let start = fromBlock; start <= toBlock; start += chunkSize) {
		const end = Math.min(start + chunkSize - 1, toBlock);

		let attempt = 0;
		while (attempt <= retries) {
			try {
				const result = await provider.getLogs({
					...filter,
					fromBlock: start,
					toBlock: end,
				});
				logs.push(...result);
				break;
			} catch (error) {
				if (attempt >= retries) {
					console.error(
						"Fallo al obtener logs",
						{ fromBlock: start, toBlock: end },
						error
					);
					throw error;
				}
				const delay = 500 * Math.pow(2, attempt);
				await sleep(delay);
				attempt += 1;
			}
		}
		if (delayMs > 0 && start + chunkSize - 1 < toBlock) {
			await sleep(delayMs);
		}
	}
	return logs;
};

const fetchBlocksBatched = async (
	provider,
	blockNumbers,
	batchSize = BLOCK_BATCH_SIZE,
	delayMs = BLOCK_BATCH_DELAY_MS
) => {
	const blocks = [];
	for (let i = 0; i < blockNumbers.length; i += batchSize) {
		const chunk = blockNumbers.slice(i, i + batchSize);
		const chunkPromises = chunk.map((blockNumber) => {
			const cacheKey = `${provider.connection?.url || ""}:${blockNumber}`;
			if (blockCache.has(cacheKey)) {
				return Promise.resolve(blockCache.get(cacheKey));
			}
			return provider.getBlock(blockNumber).then((block) => {
				blockCache.set(cacheKey, block);
				return block;
			});
		});

		const resolved = await Promise.all(chunkPromises);
		blocks.push(...resolved);
		if (delayMs > 0 && i + batchSize < blockNumbers.length) {
			await sleep(delayMs);
		}
	}
	return blocks;
};

const deriveKnownTags = (address, knownAddresses = {}) => {
	if (!address) return [];
	const lower = address.toLowerCase();
	return Object.entries(knownAddresses)
		.filter(([, candidate]) => candidate && candidate.toLowerCase() === lower)
		.map(([label]) => label);
};

export async function getPairPrice(pairAddress, providerOverride) {
	const provider =
		providerOverride ||
		new ethers.providers.JsonRpcProvider(
			process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL
		);

	const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);

	const reserves = await pairContract.getReserves();
	const reserve0 = reserves.reserve0.toString();
	const reserve1 = reserves.reserve1.toString();

	const token0Price = reserve1 / reserve0;
	const token1Price = reserve0 / reserve1;

	return { token0Price, token1Price };
}

export const getPrice = async (pair1address, pair2address, provider) => {
	try {
		const { token0Price } = await getPairPrice(pair1address, provider);

		const { token1Price } = await getPairPrice(pair2address, provider);

		const precio = token0Price * token1Price;

		return precio;
	} catch (error) {
		console.error("Error al obtener el precio de MTB:", error);
	}
};


export const fetchTransferEventsWithMetadata = async (
	contract,
	provider,
	options = {}
) => {
	const cacheKey = getCacheKey(contract.address);
	if (eventsCache.has(cacheKey)) {
		return eventsCache.get(cacheKey);
	}

	const transferFilter = contract.filters?.Transfer?.() ?? "Transfer";
	const latestBlock = options.endBlock ?? (await provider.getBlockNumber());
	const startBlock = options.startBlock ?? 0;
	const chunkSize = options.chunkSize ?? 20000;

	const rawLogs = await fetchLogsInChunks(
		provider,
		{
			address: contract.address,
			topics: transferFilter.topics ?? [contract.interface.getEventTopic("Transfer")],
		},
		startBlock,
		latestBlock,
		chunkSize
	);

	if (rawLogs.length === 0) {
		eventsCache.set(cacheKey, []);
		return [];
	}

	let blocks;
	try {
		const uniqueBlocks = [...new Set(rawLogs.map((log) => log.blockNumber))];
		blocks = await fetchBlocksBatched(provider, uniqueBlocks);
	} catch (error) {
		console.error("No se pudieron obtener los bloques de referencia", error);
		const fallback = rawLogs.map((log) => {
			const parsed = contract.interface.parseLog(log);
			return {
				hash: log.transactionHash,
				from: parsed.args.from,
				to: parsed.args.to,
				value: (() => {
					const amount = extractTransferAmount({ args: parsed.args });
					return amount !== null ? parseFloat(amount) : 0;
				})(),
				blockNumber: log.blockNumber,
				timestamp: null,
			};
		});
		eventsCache.set(cacheKey, fallback);
		return fallback;
	}

	const timestampMap = new Map(
		blocks.map((block) => [block.number, block.timestamp * 1000])
	);

	const parsedEvents = rawLogs.map((log) => {
		const parsed = contract.interface.parseLog(log);
		return {
			hash: log.transactionHash,
			from: parsed.args.from,
			to: parsed.args.to,
			value: (() => {
				const amount = extractTransferAmount({ args: parsed.args });
				return amount !== null ? parseFloat(amount) : 0;
			})(),
			blockNumber: log.blockNumber,
			timestamp: timestampMap.get(log.blockNumber) ?? null,
		};
	});

	eventsCache.set(cacheKey, parsedEvents);
	return parsedEvents;
};

export const calculateHoldersDetail = async (
	contract,
	knownAddresses = {},
	transferEvents = []
) => {
	const addresses = new Set();
	transferEvents.forEach((event) => {
		if (event.to) addresses.add(event.to);
		if (event.from) addresses.add(event.from);
	});

const details = await Promise.all(
		[...addresses]
			.filter(
				(address) =>
					address && address.toLowerCase() !== ADDRESS_ZERO.toLowerCase()
			)
			.map(async (address) => {
				try {
					const balanceWei = await contract.balanceOf(address);
					const balance = parseFloat(ethers.utils.formatEther(balanceWei));
					if (balance <= 0) {
						return null;
					}
					return {
						address,
						balance,
						tags: deriveKnownTags(address, knownAddresses),
					};
				} catch (error) {
					console.error("No se pudo obtener balance para", address, error);
					return null;
				}
			})
	);

	return details.filter(Boolean).sort((a, b) => b.balance - a.balance);
};

export const calculateHoldersCount = async (contract, knownAddresses = {}) => {
	const transferEvents = await contract.queryFilter("Transfer");
	const holdersDetail = await calculateHoldersDetail(
		contract,
		knownAddresses,
		transferEvents.map((event) => ({
			to: event.args.to,
			from: event.args.from,
			value: extractTransferAmount(event),
		}))
	);

	return {
		holdersCount: holdersDetail.length,
		holdersWallets: new Set(holdersDetail.map((holder) => holder.address)),
		transferEventsCount: transferEvents.length,
		holdersDetail,
	};
};

export const computeTokensSoldBetween = (
	transferEvents,
	crowdsaleAddress,
	startDate,
	endDate
) => {
	if (!crowdsaleAddress) return 0;
	if (!Array.isArray(transferEvents) || transferEvents.length === 0) return 0;
	const lowerCrowdsale = crowdsaleAddress.toLowerCase();
	const startMs = startDate.getTime();
	const endMs = endDate.getTime();

	return transferEvents.reduce((acc, event) => {
		if (!event.timestamp) return acc;
		if (event.from?.toLowerCase() !== lowerCrowdsale) return acc;
		if (event.timestamp < startMs || event.timestamp > endMs) return acc;
		const amount =
			event.value !== undefined
				? Number(event.value)
				: Number(extractTransferAmount(event)) || 0;
		return acc + amount;
	}, 0);
};

export const computeTokensSoldForYear = (
	transferEvents,
	crowdsaleAddress,
	year
) => {
	const start = new Date(Date.UTC(year, 0, 1));
	const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
	return computeTokensSoldBetween(transferEvents, crowdsaleAddress, start, end);
};

export const fetchPairPriceHistory = async (
	provider,
	pairAddress,
	tokenAddress
) => {
	if (!pairAddress) return [];
	const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
	const [token0, token1] = await Promise.all([
		pairContract.token0(),
		pairContract.token1(),
	]);

	const token0Lower = token0.toLowerCase();
	const token1Lower = token1.toLowerCase();
	const targetLower = tokenAddress?.toLowerCase();
	const isToken0 = targetLower === token0Lower;
	const orientedTokenAddress = isToken0 ? token0 : token1;
	const counterpartTokenAddress = isToken0 ? token1 : token0;

	const [tokenDecimals, counterpartDecimals] = await Promise.all([
		new ethers.Contract(orientedTokenAddress, erc20Abi, provider).decimals(),
		new ethers.Contract(counterpartTokenAddress, erc20Abi, provider).decimals(),
	]);

	const latestBlock = await provider.getBlockNumber();
	const fromBlock = Math.max(latestBlock - 200000, 0);
	const syncEvents = await pairContract.queryFilter(
		pairContract.filters.Sync(),
		fromBlock,
		latestBlock
	);

	const trimmedEvents = syncEvents.slice(-SAFE_SYNC_LIMIT);
	if (trimmedEvents.length === 0) return [];

	const uniqueBlockNumbers = [
		...new Set(trimmedEvents.map((event) => event.blockNumber)),
	];
	const blocks = await Promise.all(
		uniqueBlockNumbers.map((blockNumber) => provider.getBlock(blockNumber))
	);
	const timestampMap = new Map(
		blocks.map((block) => [block.number, block.timestamp * 1000])
	);

	return trimmedEvents
		.map((event) => {
			const reserve0 = parseFloat(
				ethers.utils.formatUnits(event.args.reserve0, tokenDecimals)
			);
			const reserve1 = parseFloat(
				ethers.utils.formatUnits(event.args.reserve1, counterpartDecimals)
			);
			if (reserve0 === 0 || reserve1 === 0) {
				return null;
			}
			const price = ensureFiniteNumber(
				isToken0 ? reserve1 / reserve0 : reserve0 / reserve1
			);
			if (price === null) return null;
			return {
				timestamp: timestampMap.get(event.blockNumber) ?? null,
				price,
			};
		})
		.filter((entry) => entry && entry.timestamp)
		.sort((a, b) => a.timestamp - b.timestamp);
};

export const tokenDataInspector = async (contract, address) => {
	const name = await contract.name();
	const symbol = await contract.symbol();
	const totalSupplyWei = await contract.totalSupply();
	const totalSupply = ensureFiniteNumber(
		ethers.utils.formatEther(totalSupplyWei)
	);

	let vcoIssuanceWei;
	let vcoIssuance;

	try {
		vcoIssuanceWei = await contract.cap();
		vcoIssuance = ethers.utils.formatEther(vcoIssuanceWei);
	} catch (error) {
		const fallback = VCOPrices.find((entry) => entry.symbol === symbol);
		vcoIssuance = fallback?.tokenInssuance ?? 0;
	}

	const totalSupplyNumeric = ensureFiniteNumber(totalSupply ?? 0) ?? 0;
	const vcoIssuanceNumeric = ensureFiniteNumber(vcoIssuance) ?? 0;
	const burnedTokensDrunk = Math.max(vcoIssuanceNumeric - totalSupplyNumeric, 0);

	const staticContractData = contracts.find(
		(entry) => entry.contractAddress === address
	);

	const {
		crowdsaleAddress,
		uniswapUri,
		lpContractAddress,
		holdersUrl,
		network,
		priceReferencePair,
		archived,
		displayName,
		legacyAddress,
		migratedTo,
		startBlock,
	} = staticContractData || {};

	const legacyContractMeta = legacyAddress
		? contracts.find(
				(entry) =>
					entry.contractAddress &&
					entry.contractAddress.toLowerCase() === legacyAddress.toLowerCase()
			  )
		: null;

	let { tokensToBurn, legacyBurned } = staticContractData || {};
	const burnedFromLegacy = legacyContractMeta?.burned;
	if (burnedFromLegacy != null) {
		if (legacyBurned == null) {
			legacyBurned = burnedFromLegacy;
		}
		if (tokensToBurn == null) {
			tokensToBurn = burnedFromLegacy;
		}
	}

	let vcoSourceNetwork = network ?? null;
	let vcoSourceNetworkLabel = vcoSourceNetwork
		? NETWORK_CONFIG[vcoSourceNetwork]?.label ?? vcoSourceNetwork
		: null;

	if (legacyContractMeta?.network) {
		vcoSourceNetwork = legacyContractMeta.network;
		vcoSourceNetworkLabel =
			NETWORK_CONFIG[legacyContractMeta.network]?.label ?? legacyContractMeta.network;
	}

	if (!vcoSourceNetwork && archived && network) {
		vcoSourceNetwork = network;
		vcoSourceNetworkLabel =
			NETWORK_CONFIG[network]?.label ?? network;
	}

	const vcoData = VCOPrices.find((entry) => entry.symbol === symbol);

	return {
		address,
		name,
		symbol,
		totalSupply: totalSupplyNumeric,
		vcoIssuance: vcoIssuanceNumeric,
		burnedTokensDrunk,
		burnedTokens: burnedTokensDrunk,
		crowdsaleAddress,
		uniswapUri,
		lpContractAddress,
		holdersUrl,
		network,
		priceReferencePair,
		archived,
		displayName,
		legacyAddress,
		migratedTo,
		startBlock,
		tokensToBurn,
		legacyBurned,
		vcoSourceNetwork,
		vcoSourceNetworkLabel,
		vcoStartDate: vcoData?.dateStart ?? null,
		vcoEndDate: vcoData?.dateEnd ?? null,
		vcoPriceEth: vcoData?.priceEth ?? null,
		vcoPriceArs: vcoData?.priceArs ?? null,
		vcoPriceUsd: vcoData?.priceUsd ?? null,
	};
};
