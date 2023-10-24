const { ethers } = require('ethers');
import { useEffect, useState } from 'react';
import {
  ETH_DAI_PAIR,
  MTB19Address,
  MTB19_ETH_PAIR,
  MTB_ABI,
} from '../../../contracts';
import TokenInfoComponent from '@/components/TokenInfoComponent';

const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;

const provider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_ID}`
);

const address = MTB19Address;

const contract = new ethers.Contract(address, MTB_ABI, provider);

async function getPairPrice(pairAddress) {
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

const getPrice = async () => {
  const pair1address = MTB19_ETH_PAIR;
  const pair2address = ETH_DAI_PAIR;

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

const calculateHoldersCount = async () => {
  const uniqueHolders = new Set();
  const transferEvents = await contract.queryFilter('Transfer');
  console.log('transferEvents: ', transferEvents);
  for (const event of transferEvents) {
    const toAddress = event.args.to;
    const balanceWei = await contract.balanceOf(toAddress);
    const balance = ethers.utils.formatEther(balanceWei);
    if (parseFloat(balance) > 0) {
      uniqueHolders.add(toAddress);
    }
    console.log('uniqueHoldersCount:', uniqueHolders.size);
  }

  const data = {
    holdersCount: uniqueHolders.size,
    holdersWallets: uniqueHolders,
    transferEventsCount: transferEvents.length,
  };
  return { ...data };
};

const tokenDataInspector = async () => {
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

  // const { holdersCount, transferEventsCount } = await calculateHoldersCount();

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

const Tokens = () => {
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    totalSupply: 0,
    burnedTokens: 0,
    holdersCount: -1,
    totalTransfers: -1,
    tokenContract: '',
    crowdsaleContract: '',
    lpContract: '',
    vcoStartDate: '',
    vcoEndDate: '',
    vcoPrice: 0,
    vcoPriceFiat: '',
    adminAddress: '',
    price: -1,
    initialLpTokenDeposit: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const fetchTokenDataPromise = (async () => {
        const data = await tokenDataInspector();
        const {
          address,
          name,
          symbol,
          totalSupply,
          vcoIssuance,
          balance,
          burnedTokensDrunk,
        } = data;

        setTokenInfo((prev) => ({
          ...prev,
          vcoIssuance,
          name,
          symbol,
          balance,
          totalSupply,
          burnedTokens: burnedTokensDrunk,

          tokenContract: address,
          // crowdsaleContract: '',
          // lpContract: '',
          // vcoStartDate: '',
          // vcoEndDate: '',
          // vcoPrice: 0,
          // vcoPriceFiat: '',
          // adminAddress: '',
          // initialLpTokenDeposit: 0,
        }));
      })();

      const fetchPricePromise = (async () => {
        const price = await getPrice();
        console.log(price, '////////////////////////');
        setTokenInfo((prev) => ({
          ...prev,
          price,
        }));
      })();

      const calculateHoldersCountPromise = (async () => {
        const { holdersCount, transferEventsCount } =
          await calculateHoldersCount();
        setTokenInfo((prev) => ({
          ...prev,
          holdersCount,
          totalTransfers: transferEventsCount,
        }));
      })();

      const promises = [
        fetchTokenDataPromise,
        fetchPricePromise,
        calculateHoldersCountPromise,
      ];

      Promise.all(promises).catch((error) => {
        console.error('Error al obtener datos del token:', error);
      });
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await tokenDataInspector();
  //       const {
  //         address,
  //         name,
  //         symbol,
  //         totalSupply,
  //         vcoIssuance,
  //         balance,
  //         burnedTokensDrunk,
  //       } = data;

  //       setTokenInfo({
  //         vcoIssuance,
  //         name,
  //         symbol,
  //         balance,
  //         totalSupply,
  //         burnedTokens: burnedTokensDrunk,
  //         holders: 0,
  //         totalTransfers: 0,
  //         tokenContract: address,
  //         crowdsaleContract: '',
  //         lpContract: '',
  //         vcoStartDate: '',
  //         vcoEndDate: '',
  //         vcoPrice: 0,
  //         vcoPriceFiat: '',
  //         adminAddress: '',
  //         initialLpTokenDeposit: 0,
  //         price: 0,
  //       });

  //       const price = await getPrice();
  //       console.log(price, '////////////////////////');
  //       setTokenInfo((prev) => ({
  //         ...prev,
  //         price,
  //       }));

  //       const { holdersCount, transferEventsCount } =
  //         await calculateHoldersCount();

  //       setTokenInfo((prev) => ({
  //         ...prev,
  //         holdersCount,
  //         totalTransfers: transferEventsCount,
  //       }));
  //     } catch (error) {
  //       console.error('Error al obtener datos del token:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <div>
      {tokenInfo ? <TokenInfoComponent tokenInfo={tokenInfo} /> : 'Loading...'}
    </div>
  );
};

export default Tokens;
