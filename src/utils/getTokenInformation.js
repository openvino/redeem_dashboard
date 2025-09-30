import { contracts, VCOPrices } from "../../contracts";

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
	if (!Number.isFinite(value)) return null;
	if (Number.isNaN(value)) return null;
	return value;
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

export const fetchTransferEventsWithMetadata = async (contract, provider) => {
	const transferFilter = contract.filters?.Transfer?.() ?? "Transfer";
	const transferEvents = await contract.queryFilter(transferFilter);

	if (transferEvents.length === 0) {
		return [];
	}

	const uniqueBlocks = [
		...new Set(transferEvents.map((event) => event.blockNumber)),
	];
	let blocks;
	try {
		blocks = await Promise.all(
			uniqueBlocks.map((blockNumber) => provider.getBlock(blockNumber))
		);
	} catch (error) {
		console.error("No se pudieron obtener los bloques de referencia", error);
		return transferEvents.map((event) => ({
			hash: event.transactionHash,
			from: event.args.from,
			to: event.args.to,
			value: parseFloat(ethers.utils.formatEther(event.args.value)),
			blockNumber: event.blockNumber,
			timestamp: null,
		}));
	}
	const timestampMap = new Map(
		blocks.map((block) => [block.number, block.timestamp * 1000])
	);

	return transferEvents.map((event) => ({
		hash: event.transactionHash,
		from: event.args.from,
		to: event.args.to,
		value: parseFloat(ethers.utils.formatEther(event.args.value)),
		blockNumber: event.blockNumber,
		timestamp: timestampMap.get(event.blockNumber) ?? null,
	}));
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
		return acc + (event.value ?? 0);
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
	const totalSupply = ethers.utils.formatEther(totalSupplyWei);

	let vcoIssuanceWei;
	let vcoIssuance;

	try {
		vcoIssuanceWei = await contract.cap();
		vcoIssuance = ethers.utils.formatEther(vcoIssuanceWei);
	} catch (error) {
		const fallback = VCOPrices.find((entry) => entry.symbol === symbol);
		vcoIssuance = fallback?.tokenInssuance ?? 0;
	}

	const burnedTokensDrunk = vcoIssuance - totalSupply;

	const staticContractData = contracts.find(
		(entry) => entry.contractAddress === address
	);

	const { crowdsaleAddress, uniswapUri, lpContractAddress, holdersUrl } =
		staticContractData || {};
	console.log("staticContractData", staticContractData);

	const vcoData = VCOPrices.find((entry) => entry.symbol === symbol);

	return {
		address,
		name,
		symbol,
		totalSupply: Math.trunc(totalSupply),
		vcoIssuance: Math.trunc(vcoIssuance),
		burnedTokensDrunk: Math.trunc(burnedTokensDrunk),
		crowdsaleAddress,
		uniswapUri,
		lpContractAddress,
		holdersUrl,
		vcoStartDate: vcoData?.dateStart ?? null,
		vcoEndDate: vcoData?.dateEnd ?? null,
		vcoPriceEth: vcoData?.priceEth ?? null,
		vcoPriceArs: vcoData?.priceArs ?? null,
		vcoPriceUsd: vcoData?.priceUsd ?? null,
	};
};
