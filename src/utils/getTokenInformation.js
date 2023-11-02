import {
  MTB18Address,
  MTB18_ETH_PAIR,
  MTB19Address,
  MTB19_ETH_PAIR,
  MTB20Address,
  MTB20_ETH_PAIR,
  MTB21Address,
  MTB21_ETH_PAIR,
  MTB22Address,
  MTB22_ETH_PAIR,
  MTB23Address,
  MTB23_ETH_PAIR,
  MTB_ABI,
} from '../../contracts';

import { ethers } from 'ethers';

export const contratos = [
  {
    name: 'MTB18',
    contractAddress: MTB18Address,
    contractPairAddress: MTB18_ETH_PAIR,
  },
  {
    name: 'MTB19',
    contractAddress: MTB19Address,
    contractPairAddress: MTB19_ETH_PAIR,
  },

  {
    name: 'MTB20',
    contractAddress: MTB20Address,
    contractPairAddress: MTB20_ETH_PAIR,
  },
  {
    name: 'MTB21',
    contractAddress: MTB21Address,
    contractPairAddress: MTB21_ETH_PAIR,
  },
  {
    name: 'MTB22',
    contractAddress: MTB22Address,
    contractPairAddress: MTB22_ETH_PAIR,
  },
  {
    name: 'MTB23',
    contractAddress: MTB23Address,
    contractPairAddress: MTB23_ETH_PAIR,
  },
];

export async function getPairPrice(pairAddress) {
  const provider = new ethers.providers.JsonRpcProvider(
    'https://eth-mainnet.g.alchemy.com/v2/Mhhe8YLO8wfrZet4bwKyh0VOepmZDi35'
  );

  // Abre el contrato del par de tokens
  const pairContract = new ethers.Contract(
    pairAddress,
    [
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    ],
    provider
  );

  // Obtiene los datos de reserva del par de tokens
  const reserves = await pairContract.getReserves();
  const reserve0 = reserves.reserve0.toString();
  const reserve1 = reserves.reserve1.toString();

  // Calcula el precio del token en función de las reservas
  const token0Price = reserve1 / reserve0;
  const token1Price = reserve0 / reserve1;

  console.log(`Precio del Token0 en Ether: ${token0Price}`);
  console.log(`Precio del Token1 en Ether: ${token1Price}`);
  return { token0Price, token1Price };
}

export const getPrice = async (pair1address, pair2address) => {
  try {
    const { token0Price } = await getPairPrice(pair1address);
    console.log(`El precio del token MTB en Ether es: ${token0Price}`);

    const { token1Price } = await getPairPrice(pair2address);
    console.log(`El precio del token DAI en Ether es: ${token1Price}`);

    const precio = token0Price * token1Price;
    console.log('Precio del MTB en DAI es: ', precio);

    return precio;
  } catch (error) {
    console.error('Error al obtener el precio de MTB:', error);
  }
};

export const calculateHoldersCount = async (contract) => {
  const uniqueHolders = new Set();
  const transferEvents = await contract.queryFilter('Transfer');
  console.log('transferEvents: ', transferEvents);

  const promises = transferEvents.map(async (event) => {
    const toAddress = event.args.to;
    const balanceWei = await contract.balanceOf(toAddress);
    const balance = ethers.utils.formatEther(balanceWei);

    if (parseFloat(balance) > 0) {
      uniqueHolders.add(toAddress);
    }
  });

  await Promise.all(promises);

  console.log('uniqueHoldersCount:', uniqueHolders.size);

  const data = {
    holdersCount: uniqueHolders.size,
    holdersWallets: uniqueHolders,
    transferEventsCount: transferEvents.length,
  };
  return { ...data };
};

export const tokenDataInspector = async (contract, address) => {
  const name = await contract.name();
  const symbol = await contract.symbol();

  const totalSupplyWei = await contract.totalSupply();
  const totalSupply = ethers.utils.formatEther(totalSupplyWei);

  const balanceWei = await contract.balanceOf(
    '0x34bC045416c8D2Ae1cFDD8789eF8C10E2A079Ca8'
  );
  const balance = ethers.utils.formatEther(balanceWei);

  const vcoIssuanceWei = await contract.cap();
  const vcoIssuance = ethers.utils.formatEther(vcoIssuanceWei);
  const burnedTokensDrunk = vcoIssuance - totalSupply;

  const tokenData = {
    address,
    name,
    symbol,
    totalSupply,
    vcoIssuance,
    balance,
    burnedTokensDrunk,
    // holdersCount,
    // transferEventsCount,
  };

  return tokenData;
};
