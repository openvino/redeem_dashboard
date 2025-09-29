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
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x7ecadc96563a0e158f1a1eec220bb4f661640d39",
		crowdsaleAddress: "0xd237f244a7eb67fe2057f119878c1a8918786a74",
		lpContractAddress: "0x7ECaDC96563a0E158f1a1Eec220Bb4f661640D39",
	},
	{
		name: "MTB19",
		contractAddress: "0xd9fc98e7ed79FB67aB5f36013D958aBd85Ff28fF",
		contractPairAddress: "0x07aA6e8fef4A368D111040B2bF5dD570b75a2781",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x9177f33f833761fb0eea7b72a5db487a7c140f5c",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0x9177F33f833761fB0eea7b72a5db487a7C140F5C",
	},

	{
		name: "MTB20",
		contractAddress: "0x3d98E5829A1bAE7423cf3874662c2f3a0c72123F",
		contractPairAddress: "0xe497383530ffDD92c1caF7a6072C384E0131D7ef",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x0b583f7790f0237c8dc3cbdd1888fec4d61b1216",
		crowdsaleAddress: "0x5411bffa359fF9cEbA0ED275aC5F00aB3435cB47",
		lpContractAddress: "0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216",
	},
	{
		name: "MTB21",
		contractAddress: "0x9a7DF7eD3c536c1940DD98786f3eEfb7810E2f8f",
		contractPairAddress: "0x4c2871bc115c01Fb05EE95d377EA67F159f148Fa",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0xdefdc4abadf4325da78a2ae43128daa00ec3bdcf",
		crowdsaleAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
		lpContractAddress: "0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF",
	},
	{
		name: "MTB22",
		contractAddress: "0xeF89072a1f25c2aDA952c2e04644289906e0e6F9",
		contractPairAddress: "0x6Ed45D02A70C116b6aE9f0A928474D4c41B1AFb7",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x38441febe76d2f0e167972aa017da263ea755306",
		crowdsaleAddress: "0xF8AA6d87fc011617d1FF00a2fcE5e8254dC7fDef",
		lpContractAddress: "0x38441FEBE76d2F0e167972aA017dA263EA755306",
	},
	{
		name: "MTB23",
		contractAddress: "0x80B19e1BD4f5c96bc5cC7f1fc0A3731eBb0F8820",
		contractPairAddress: "0xAc826B4901F92e910EA829D64A49BB624A41c548",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x23b97d75dec21479d126530d2c1582227abd394b",
		crowdsaleAddress: "//todo",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
	},
	{
		name: "MTB24",
		contractAddress: "0xeD9eC0f741F52c9B62b7154B30Ed89AC2F389Cfe",
		contractPairAddress: "0xf8f0d8F21Be23E97cE7524656Cb6326e5582609A",
		uniswapUri:
			"https://v2.info.uniswap.org/pair/0x23b97d75dec21479d126530d2c1582227abd394b",
		crowdsaleAddress: "//todo",
		lpContractAddress: "0xD60b471BD8C62dc4d2f04493413c6CB73b7ce464",
	},
];

// redeem.costaflores.openvino.eth 0xe613FAF5fA44f019E3A3AF5927bAA6B13643BA53
