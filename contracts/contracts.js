export const MTB_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function cap() view returns (uint)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint)',
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

export const MTB18Address = '0x1bcfd19f541eb62c8cfebe53fe72bf2afc35a255';
export const MTB18_ETH_PAIR = '0x7ecadc96563a0e158f1a1eec220bb4f661640d39';
export const MTB18_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0x7ecadc96563a0e158f1a1eec220bb4f661640d39';
export const MTB18AddressCrowdsale = '//todo';
export const MTB18LPContractAddress = '//todo';

export const MTB19Address = '0x87AB739464881af0011052D4Ca0B0d657e8c3B48';
export const MTB19_ETH_PAIR = '0x9177F33f833761fB0eea7b72a5db487a7C140F5C';
export const MTB19_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0x9177f33f833761fb0eea7b72a5db487a7c140f5c';
export const MTB19AddressCrowdsale = '//todo';
export const MTB19LPContractAddress = '//todo';

export const MTB20Address = '0x6a2f414E1298264ecD446D6Bb9Da012760336A4f';
export const MTB20_ETH_PAIR = '0x0B583f7790f0237C8dc3CBdD1888FEc4d61B1216';
export const MTB20_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0x0b583f7790f0237c8dc3cbdd1888fec4d61b1216';
export const MTB20AddressCrowdsale = '//todo';
export const MTB20LPContractAddress = '//todo';

export const MTB21Address = '0x69d3Af30c63F5bd916bBcD79b58dBc8BD16D0308';
export const MTB21_ETH_PAIR = '0xdEfdc4abADF4325da78A2AE43128daa00ec3bDCF';
export const MTB21_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0xdefdc4abadf4325da78a2ae43128daa00ec3bdcf';
export const MTB21AddressCrowdsale = '//todo';
export const MTB21LPContractAddress = '//todo';

export const MTB22Address = '0x0DB11855a6bB7410302d0c14c699c6508Ba29FD7';
export const MTB22AddressCrowdsale =
  '0xF8AA6d87fc011617d1FF00a2fcE5e8254dC7fDef';
export const MTB22_ETH_PAIR = '0x38441FEBE76d2F0e167972aA017dA263EA755306';
export const MTB22_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0x38441febe76d2f0e167972aa017da263ea755306';
export const MTB22LPContractAddress = '//todo';

export const MTB23Address = '0x507E05Fc43E652CE5339C7499c5cE669C166AbE3';
export const MTB23AddressCrowdsale = '//todo';
export const MTB23_ETH_PAIR = '0x23b97d75dec21479d126530d2c1582227abd394b';
export const MTB23_UNISWAPP_URL =
  'https://v2.info.uniswap.org/pair/0x23b97d75dec21479d126530d2c1582227abd394b';
export const MTB23LPContractAddress = '//todo';

export const ETH_DAI_PAIR = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';

export const VCOPrices = [
  {
    name: 'MikeTangoBravo18',
    tokenInssuance: 16384,
    priceEth: 0.0078,
    dateStart: '6 - MAY - 2018',
    dateEnd: '25 - JULY - 2018',
  },
  {
    name: 'MikeTangoBravo19',
    tokenInssuance: 17707,
    priceEth: 0.027778,
    dateStart: '6 - MAY - 2019',
    dateEnd: '25 - JULY - 2019',
  },

  {
    name: 'MikeTangoBravo20',
    tokenInssuance: 9600,
    priceEth: 0.013698630136986302,
    dateStart: '6 - MAY - 2020',
    dateEnd: '25 - JULY - 2020',
  },
  {
    name: 'MikeTangoBravo21',
    tokenInssuance: 12121,
    priceEth: 0.00081168831168831169,
    dateStart: '6 - MAY - 2021',
    dateEnd: '25 - JULY - 2021',
  },
  {
    name: 'MikeTangoBravo22',
    tokenInssuance: 8192,
    priceEth: 0.001590792453454557,
    dateStart: '6 - MAY - 2022',
    dateEnd: '25 - JULY - 2022',
  },
  {
    name: 'MikeTangoBravo23',
    tokenInssuance: 1024,
    priceEth: 0.006896551724137932,
    dateStart: '6 - MAY - 2023',
    dateEnd: '25 - JULY - 2023',
  },
];

export const contracts = [
  {
    name: 'MTB18',
    contractAddress: MTB18Address,
    contractPairAddress: MTB18_ETH_PAIR,
    uniswapUri: MTB18_UNISWAPP_URL,
    crowdsaleAddress: MTB18AddressCrowdsale,
    lpContractAddress: MTB18LPContractAddress,
  },
  {
    name: 'MTB19',
    contractAddress: MTB19Address,
    contractPairAddress: MTB19_ETH_PAIR,
    uniswapUri: MTB19_UNISWAPP_URL,
    crowdsaleAddress: MTB19AddressCrowdsale,
    lpContractAddress: MTB19LPContractAddress,
  },

  {
    name: 'MTB20',
    contractAddress: MTB20Address,
    contractPairAddress: MTB20_ETH_PAIR,
    uniswapUri: MTB20_UNISWAPP_URL,
    crowdsaleAddress: MTB20AddressCrowdsale,
    lpContractAddress: MTB20LPContractAddress,
  },
  {
    name: 'MTB21',
    contractAddress: MTB21Address,
    contractPairAddress: MTB21_ETH_PAIR,
    uniswapUri: MTB21_UNISWAPP_URL,
    crowdsaleAddress: MTB21AddressCrowdsale,
    lpContractAddress: MTB21LPContractAddress,
  },
  {
    name: 'MTB22',
    contractAddress: MTB22Address,
    contractPairAddress: MTB22_ETH_PAIR,
    uniswapUri: MTB22_UNISWAPP_URL,
    crowdsaleAddress: MTB22AddressCrowdsale,
    lpContractAddress: MTB22LPContractAddress,
  },
  {
    name: 'MTB23',
    contractAddress: MTB23Address,
    contractPairAddress: MTB23_ETH_PAIR,
    uniswapUri: MTB23_UNISWAPP_URL,
    crowdsaleAddress: MTB23AddressCrowdsale,
    lpContractAddress: MTB23LPContractAddress,
  },
];
