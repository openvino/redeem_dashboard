import { contracts, VCOPrices } from '../../contracts';

import { ethers } from 'ethers';

export async function getPairPrice(pairAddress) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL
  );

  const pairContract = new ethers.Contract(
    pairAddress,
    [
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    ],
    provider
  );

  const reserves = await pairContract.getReserves();
  const reserve0 = reserves.reserve0.toString();
  const reserve1 = reserves.reserve1.toString();

  const token0Price = reserve1 / reserve0;
  const token1Price = reserve0 / reserve1;

  return { token0Price, token1Price };
}

export const getPrice = async (pair1address, pair2address) => {
  try {
    const { token0Price } = await getPairPrice(pair1address);

    const { token1Price } = await getPairPrice(pair2address);

    const precio = token0Price * token1Price;

    return precio;
  } catch (error) {
    console.error('Error al obtener el precio de MTB:', error);
  }
};

export const calculateHoldersCount = async (contract) => {
  const uniqueHolders = new Set();
  const transferEvents = await contract.queryFilter('Transfer');

  const promises = transferEvents.map(async (event) => {
    const toAddress = event.args.to;
    const balanceWei = await contract.balanceOf(toAddress);
    const balance = ethers.utils.formatEther(balanceWei);

    if (parseFloat(balance) > 0) {
      uniqueHolders.add(toAddress);
    }
  });

  await Promise.all(promises);

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

  let vcoIssuanceWei;
  let vcoIssuance;

  try {
    vcoIssuanceWei = await contract.cap();
    vcoIssuance = ethers.utils.formatEther(vcoIssuanceWei);
  } catch (error) {
    const filtered = VCOPrices.filter((e) => e.symbol === symbol);
    vcoIssuance = filtered[0].tokenInssuance;
  }

  const burnedTokensDrunk = vcoIssuance - totalSupply;

  const filteredStaticContractData = contracts.find(
    (e) => e.contractAddress === address
  );

  const { crowdsaleAddress, uniswapUri, lpContractAddress } =
    filteredStaticContractData;

  const tokenData = {
    address,
    name,
    symbol,
    totalSupply: Math.trunc(totalSupply),
    vcoIssuance: Math.trunc(vcoIssuance),
    burnedTokensDrunk: Math.trunc(burnedTokensDrunk),
    crowdsaleAddress,
    uniswapUri,
    lpContractAddress,
  };

  return tokenData;
};
