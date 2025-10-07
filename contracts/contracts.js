export const OVT_ABI = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function cap() view returns (uint)",
	"function totalSupply() view returns (uint256)",
	"function balanceOf(address) view returns (uint)",
	"event Transfer(address indexed from, address indexed to, uint amount)",
];

export const NETWORK_CONFIG = {
	base: {
		key: "base",
		label: "Base",
		referencePair: "0x4200000000000000000000000000000000000006",
		providerEnvVars: [
			"NEXT_PUBLIC_BASE_PROVIDER_URL",
			"NEXT_PUBLIC_ETHEREUM_PROVIDER_URL",
		],
		explorer: "https://basescan.org",
	},
	ethereum: {
		key: "ethereum",
		label: "Ethereum",
		referencePair: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
		providerEnvVars: ["NEXT_PUBLIC_ETHEREUM_MAINNET_PROVIDER_URL"],
		explorer: "https://etherscan.io",
	},
};

// Backwards compatibility export (Base WETH/DAI pair)
export const ETH_DAI_PAIR = NETWORK_CONFIG.base.referencePair;
export const ETHEREUM_MAINNET_ETH_DAI_PAIR =
	NETWORK_CONFIG.ethereum.referencePair;

export const VCOPrices = [
	{
		name: "MIKETANGOBRAVO18",
		symbol: "MTB18",
		tokenInssuance: 16384,
		priceEth: 0.0078,
		priceArs: 118.03,
		priceUsd: 16.384,
		dateStart: "6/5/2018",
		dateEnd: "25/7/2018",
	},
	{
		name: "MikeTangoBravo19",
		symbol: "MTB19",
		tokenInssuance: 17707,
		priceEth: 0.027778,
		priceArs: 198.61,
		priceUsd: 17.707,
		dateStart: "6/5/2019",
		dateEnd: "25/7/2019",
	},
	{
		name: "MikeTangoBravo20",
		symbol: "MTB20",
		tokenInssuance: 9600,
		priceEth: 0.013698630136986302,
		priceArs: 398.27,
		priceUsd: 9.6,
		dateStart: "6/5/2020",
		dateEnd: "25/7/2020",
	},
	{
		name: "MikeTangoBravo21",
		symbol: "MTB21",
		tokenInssuance: 12121,
		priceEth: 0.00081168831168831169,
		priceArs: 442.06,
		priceUsd: 12.121,
		dateStart: "6/5/2021",
		dateEnd: "25/7/2021",
	},
	{
		name: "MikeTangoBravo22",
		symbol: "MTB22",
		tokenInssuance: 8192,
		priceEth: 0.001590792453454557,
		priceArs: 848.91,
		priceUsd: 8.192,
		dateStart: "6/5/2022",
		dateEnd: "25/7/2022",
	},
	{
		name: "MikeTangoBravo23",
		symbol: "MTB23",
		tokenInssuance: 1024,
		priceEth: 0.006896551724137932,
		priceArs: 5850,
		priceUsd: 1024,
		dateStart: "6/5/2023",
		dateEnd: "25/7/2023",
	},
];

const baseContracts = [
	{
		name: "MTB18",
		displayName: "MTB18 (Base)",
		contractAddress: "0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23",
		contractPairAddress: "0xdDeC9C61cC526e79fb686d12be00577853E358Be",
		crowdsaleAddress: "0xd237f244a7eb67fe2057f119878c1a8918786a74",
		lpContractAddress: "0x7ECaDC96563a0E158f1a1Eec220Bb4f661640D39",
		holdersUrl:
			"https://basescan.org/token/0x2b1a955b2c8b49579d197eaaa7dce7dbc7b4da23#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x1bcfd19f541eb62c8cfebe53fe72bf2afc35a255",
		legacyBurned: 2497,
	},
	{
		name: "MTB19",
		displayName: "MTB19 (Base)",
		contractAddress: "0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF",
		contractPairAddress: "0x07aA6e8fef4A368D111040B2bF5dD570b75a2781",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0x9177F33f833761fB0eea7b72a5db487a7C140F5C",
		holdersUrl:
			"https://basescan.org/token/0xd9fc98e7ed79fb67ab5f36013d958abd85ff28ff#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x87AB739464881af0011052D4Ca0B0d657e8c3B48",
		legacyBurned: 121,
	},
	{
		name: "MTB20",
		displayName: "MTB20 (Base)",
		contractAddress: "0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F",
		contractPairAddress: "0xe497383530ffDD92c1caF7a6072C384E0131D7ef",
		crowdsaleAddress: "0x5411bffa359fF9cEbA0ED275aC5F00aB3435cB47",
		lpContractAddress: "0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216",
		holdersUrl:
			"https://basescan.org/token/0x3d98e5829a1bae7423cf3874662c2f3a0c72123f#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x6a2f414E1298264ecD446D6Bb9Da012760336A4f",
		legacyBurned: 48,
	},
	{
		name: "MTB21",
		displayName: "MTB21 (Base)",
		contractAddress: "0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f",
		contractPairAddress: "0x4c2871bc115c01Fb05EE95d377EA67F159f148Fa",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF",
		holdersUrl:
			"https://basescan.org/token/0x9a7df7ed3c536c1940dd98786f3eefb7810e2f8f#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x69d3Af30c63F5bd916bBcD79b58dBc8BD16D0308",
		legacyBurned: 419,
	},
	{
		name: "MTB22",
		displayName: "MTB22 (Base)",
		contractAddress: "0xeF89072a1f25c2aDA952c2e04644289906e0e6F9",
		contractPairAddress: "0x6Ed45D02A70C116b6aE9f0A928474D4c41B1AFb7",
		crowdsaleAddress: "0xF8AA6d87fc011617d1FF00a2fcE5e8254dC7fDef",
		lpContractAddress: "0x38441FEBE76d2F0e167972aA017dA263EA755306",
		holdersUrl:
			"https://basescan.org/token/0xef89072a1f25c2ada952c2e04644289906e0e6f9#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x0DB11855a6bB7410302d0c14c699c6508Ba29FD7",
		legacyBurned: 0,
	},
	{
		name: "MTB23",
		displayName: "MTB23 (Base)",
		contractAddress: "0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820",
		contractPairAddress: "0xAc826B4901F92e910EA829D64A49BB624A41c548",
		crowdsaleAddress: null,
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0x80b19e1bd4f5c96bc5cc7f1fc0a3731ebb0f8820#balances",
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyAddress: "0x507E05Fc43E652CE5339C7499c5cE669C166AbE3",
		legacyBurned: 0,
	},
	{
		name: "MTB24",
		displayName: "MTB24 (Base)",
		contractAddress: "0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe",
		contractPairAddress: "0xf8f0d8F21Be23E97cE7524656Cb6326e5582609A",
		crowdsaleAddress: null,
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe#balances",
		startBlock: 2171714,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyBurned: 0,
	},
	{
		name: "MTB25",
		displayName: "MTB25 (Base)",
		contractAddress: "0xA4972a46D2a49AbE6E5EE7406cEB7A779A1dA185",
		contractPairAddress: "",
		crowdsaleAddress: "0x4De9fBF940A4b831DFc26441A46d0468Ee462568",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0xA4972a46D2a49AbE6E5EE7406cEB7A779A1dA185#balances",
		startBlock: 29927023,
		network: NETWORK_CONFIG.base.key,
		priceReferencePair: NETWORK_CONFIG.base.referencePair,
		legacyBurned: 0,
	},
];

const legacyEthereumContracts = [
	{
		name: "MTB18",
		displayName: "MTB18 (Archive)",
		contractAddress: "0x1bcfd19f541eb62c8cfebe53fe72bf2afc35a255",
		contractPairAddress: "0x7ecadc96563a0e158f1a1eec220bb4f661640d39",
		crowdsaleAddress: "0xd237f244a7eb67fe2057f119878c1a8918786a74",
		lpContractAddress: "0x7ECaDC96563a0E158f1a1Eec220Bb4f661640D39",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x7ecadc96563a0e158f1a1eec220bb4f661640d39",
		holdersUrl:
			"https://etherscan.io/token/0x1bcfd19f541eb62c8cfebe53fe72bf2afc35a255#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23",
		startBlock: 5555793,
	},
	{
		name: "MTB19",
		displayName: "MTB19 (Archive)",
		contractAddress: "0x87AB739464881af0011052D4Ca0B0d657e8c3B48",
		contractPairAddress: "0x9177F33f833761fB0eea7b72a5db487a7C140F5C",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0x9177F33f833761fB0eea7b72a5db487a7C140F5C",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x9177f33f833761fb0eea7b72a5db487a7c140f5c",
		holdersUrl:
			"https://etherscan.io/token/0x87AB739464881af0011052D4Ca0B0d657e8c3B48#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF",
		startBlock: 7703801,
	},
	{
		name: "MTB20",
		displayName: "MTB20 (Archive)",
		contractAddress: "0x6a2f414E1298264ecD446D6Bb9Da012760336A4f",
		contractPairAddress: "0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216",
		crowdsaleAddress: "0x5411bffa359fF9cEbA0ED275aC5F00aB3435cB47",
		lpContractAddress: "0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x0b583f7790f0237c8dc3cbdd1888fec4d61b1216",
		holdersUrl:
			"https://etherscan.io/token/0x6a2f414E1298264ecD446D6Bb9Da012760336A4f#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F",
		startBlock: 10000000,
	},
	{
		name: "MTB21",
		displayName: "MTB21 (Archive)",
		contractAddress: "0x69d3Af30c63F5bd916bBcD79b58dBc8BD16D0308",
		contractPairAddress: "0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0xdefdc4abadf4325da78a2ae43128daa00ec3bdcf",
		holdersUrl:
			"https://etherscan.io/token/0x69d3Af30c63F5bd916bBcD79b58dBc8BD16D0308#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f",
		startBlock: 12367703,
	},
	{
		name: "MTB22",
		displayName: "MTB22 (Archive)",
		contractAddress: "0x0DB11855a6bB7410302d0c14c699c6508Ba29FD7",
		contractPairAddress: "0x38441FEBE76d2F0e167972aA017dA263EA755306",
		crowdsaleAddress: "0xF8AA6d87fc011617d1FF00a2fcE5e8254dC7fDef",
		lpContractAddress: "0x38441FEBE76d2F0e167972aA017dA263EA755306",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x38441febe76d2f0e167972aa017da263ea755306",
		holdersUrl:
			"https://etherscan.io/token/0x0DB11855a6bB7410302d0c14c699c6508Ba29FD7#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0xeF89072a1f25c2aDA952c2e04644289906e0e6F9",
		startBlock: 14723748,
	},
	{
		name: "MTB23",
		displayName: "MTB23 (Archive)",
		contractAddress: "0x507E05Fc43E652CE5339C7499c5cE669C166AbE3",
		contractPairAddress: "0x23b97d75dec21479d126530d2c1582227abd394b",
		crowdsaleAddress: null,
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x23b97d75dec21479d126530d2c1582227abd394b",
		holdersUrl:
			"https://etherscan.io/token/0x507E05Fc43E652CE5339C7499c5cE669C166AbE3#balances",
		network: NETWORK_CONFIG.ethereum.key,
		priceReferencePair: NETWORK_CONFIG.ethereum.referencePair,
		archived: true,
		migratedTo: "0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820",
		startBlock: 17344462,
	},
];

export const contracts = [...baseContracts, ...legacyEthereumContracts];

// redeem.costaflores.openvino.eth 0xe613FAF5fA44f019E3A3AF5927bAA6B13643BA53
