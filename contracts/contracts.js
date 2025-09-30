export const OVT_ABI = [
	"function name() view returns (string)",
	"function symbol() view returns (string)",
	"function cap() view returns (uint)",
	"function totalSupply() view returns (uint256)",
	"function balanceOf(address) view returns (uint)",
	"event Transfer(address indexed from, address indexed to, uint amount)",
];

export const ETH_DAI_PAIR = "0x4200000000000000000000000000000000000006";

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

export const contracts = [
	{
		name: "MTB18",
		contractAddress: "0x2b1A955b2C8B49579d197eAaa7DcE7DBC7b4dA23",
		contractPairAddress: "0xdDeC9C61cC526e79fb686d12be00577853E358Be",
		crowdsaleAddress: "0xd237f244a7eb67fe2057f119878c1a8918786a74",
		lpContractAddress: "0x7ECaDC96563a0E158f1a1Eec220Bb4f661640D39",
		holdersUrl:
			"https://basescan.org/token/0x2b1a955b2c8b49579d197eaaa7dce7dbc7b4da23#balances",
		startBlock: 2171714,
	},
	{
		name: "MTB19",
		contractAddress: "0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF",
		contractPairAddress: "0x07aA6e8fef4A368D111040B2bF5dD570b75a2781",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0x9177F33f833761fB0eea7b72a5db487a7C140F5C",
		holdersUrl:
			"https://basescan.org/token/0xd9fc98e7ed79fb67ab5f36013d958abd85ff28ff#balances",
		startBlock: 2171714,
	},

	{
		name: "MTB20",
		contractAddress: "0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F",
		contractPairAddress: "0xe497383530ffDD92c1caF7a6072C384E0131D7ef",
		crowdsaleAddress: "0x5411bffa359fF9cEbA0ED275aC5F00aB3435cB47",
		lpContractAddress: "0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216",
		holdersUrl:
			"https://basescan.org/token/0x3d98e5829a1bae7423cf3874662c2f3a0c72123f#balances",
	},
	{
		name: "MTB21",
		contractAddress: "0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f",
		contractPairAddress: "0x4c2871bc115c01Fb05EE95d377EA67F159f148Fa",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF",
		holdersUrl:
			"https://basescan.org/token/0x9a7df7ed3c536c1940dd98786f3eefb7810e2f8f#balances",
		startBlock: 2171714,
	},
	{
		name: "MTB22",
		contractAddress: "0xeF89072a1f25c2aDA952c2e04644289906e0e6F9",
		contractPairAddress: "0x6Ed45D02A70C116b6aE9f0A928474D4c41B1AFb7",
		crowdsaleAddress: "0xF8AA6d87fc011617d1FF00a2fcE5e8254dC7fDef",
		lpContractAddress: "0x38441FEBE76d2F0e167972aA017dA263EA755306",
		startBlock: 2171714,
	},
	{
		name: "MTB23",
		contractAddress: "0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820",
		contractPairAddress: "0xAc826B4901F92e910EA829D64A49BB624A41c548",
		crowdsaleAddress: "-",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0x80b19e1bd4f5c96bc5cc7f1fc0a3731ebb0f8820#balances",
	},
	{
		name: "MTB24",
		contractAddress: "0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe",
		contractPairAddress: "0xf8f0d8F21Be23E97cE7524656Cb6326e5582609A",
		crowdsaleAddress: "-",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe#balances",
		startBlock: 2171714,
	},
	{
		name: "MTB25",
		contractAddress: "0xA4972a46D2a49AbE6E5EE7406cEB7A779A1dA185",
		contractPairAddress: "",
		crowdsaleAddress: "0x4De9fBF940A4b831DFc26441A46d0468Ee462568",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		holdersUrl:
			"https://basescan.org/token/0xA4972a46D2a49AbE6E5EE7406cEB7A779A1dA185#balances",
		startBlock: 2171714,
	},
];

// redeem.costaflores.openvino.eth 0xe613FAF5fA44f019E3A3AF5927bAA6B13643BA53
