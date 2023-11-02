import React, { useEffect, useState } from 'react';
import LoadingSpinner from './Spinner';
import axios from 'axios';
import Image from 'next/image';
import { VCOPrices } from '../../contracts';
const TokenInfoComponent = ({ tokenInfo, onSelectChange, contracts }) => {
  const {
    name,
    symbol,
    balance,
    vcoIssuance,
    totalSupply,
    burnedTokens,
    holdersCount,
    totalTransfers,
    tokenContract,
    price,
    crowdsaleContract,
    lpContract,
    adminAddress,
    initialLpTokenDeposit,
  } = tokenInfo;

  const [priceFiat, setPriceFiat] = useState({ ars: 0, usd: 0 });
  const [currency, setCurrency] = useState('ars');

  const getPrice = async (ethAmount, currency) => {
    try {
      const responseUsd = await axios.get(
        'https://criptoya.com/api/bitsoalpha/eth/usd'
      );
      const responseArs = await axios.get(
        'https://criptoya.com/api/argenbtc/usdt/ars'
      );

      if (responseUsd.data && responseUsd.data.ask) {
        const ethPriceInUSD = responseUsd.data.totalAsk;
        const priceInUSD = ethAmount * ethPriceInUSD;
        const priceInARS = priceInUSD * responseArs.data.ask;
        setPriceFiat({ ars: priceInARS, usd: priceInUSD });

        return;
      } else {
        console.log('No se pudo obtener el precio de Ethereum en dólares');
        return null;
      }
    } catch (error) {
      console.error(
        'Error al obtener el precio de Ethereum en dólares:',
        error
      );
      return null;
    }
  };

  useEffect(() => {
    const price = VCOPrices.find((element) => element.name === name)?.priceEth;

    getPrice(price);
  }, [name]);

  return (
    <div className="p-4 border rounded-xl bg-[#F1EDE2] shadow-xl">
      <div className="flex flex-row justify-between">
        <div className="text-center flex">
          <Image src={'/assets/mtb.svg'} width={20} height={20} alt="mtb23" />
          <h1 className="text-md md:text-xl font-bold m-2">Token Info</h1>
        </div>
        <div className="flex justify-end gap-5 my-1 mr-10">
          <select
            name=""
            id=""
            onChange={onSelectChange}
            className="text-gray-800 border rounded-lg text-md "
            style={{ outline: 'none' }}
          >
            <option value="">Token</option>
            {contracts?.map((e, index) => (
              <option
                key={index}
                value={e.contractAddress}
                name={e.contractPairAddress}
              >
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <li className="mb-2">
          Name: <span className="font-semibold">{name}</span>
        </li>
        <li className="mb-2">
          Symbol: <span className="font-semibold">{symbol}</span>
        </li>
        <li className="mb-2">
          Balance: <span className="font-semibold">{balance}</span>
        </li>

        <li className="mb-2">
          Price: <span className="font-semibold">{price}</span>
        </li>

        <li className="mb-2">
          Token Issuance: <span className="font-semibold">{vcoIssuance}</span>
        </li>
        <li className="mb-2">
          Max Total Supply (total bottles remaining):
          <span className="font-semibold">{totalSupply}</span>
        </li>
        <li className="mb-2">
          Burned tokens (redeemed! Drunk):
          <span className="font-semibold">{burnedTokens}</span>
        </li>

        <li className="mb-2">
          Holders (drinker wallets):
          <span className="font-semibold">{holdersCount}</span>
        </li>

        {totalTransfers > -1 ? (
          <li className="mb-2">
            Total Transfers:
            <span className="font-semibold">{totalTransfers}</span>
          </li>
        ) : (
          <li className="mb-2">
            Total Transfers:
            <span>
              <div className="mt-2 w-4 h-4">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

        <li className="mb-2">
          Token Contract Address:
          <span className="font-semibold">{tokenContract}</span>
        </li>
        <li className="mb-2">
          Crowdsale Contract Address:
          <span className="font-semibold">{crowdsaleContract}</span>
        </li>
        <li className="mb-2">
          LP Contract Address:
          <span className="font-semibold">{lpContract}</span>
        </li>
        <li className="mb-2">
          VCO Start Date:{' '}
          <span className="font-semibold">
            {VCOPrices.map((element, index) => {
              if (name == element.name) return `${element.dateStart}`;
            })}
          </span>
        </li>
        <li className="mb-2">
          VCO End Date:{' '}
          <span className="font-semibold">
            {VCOPrices.map((element, index) => {
              if (name == element.name) return `${element.dateEnd}`;
            })}
          </span>
        </li>
        <li className="mb-2">
          VCO Price:
          <span className="font-semibold">
            {VCOPrices.map((element, index) => {
              if (name == element.name) return `${element.priceEth} ETH`;
            })}
          </span>
        </li>
        <li className="mb-2">
          <span className="flex flex-row">
            <div>
              VCO Fiat Price:
              {currency === 'ars' ? ` ${priceFiat.ars}` : ` ${priceFiat.usd}`}
            </div>
            <div className="">
              <select
                name="currencySelect"
                id="currencySelect"
                onChange={(e) => setCurrency(e.target.value)}
                className=" "
                style={{ outline: 'none' }}
                value={currency}
              >
                <option value="ars">ARS</option>
                <option value="usd">USD</option>
              </select>
            </div>
          </span>
        </li>
        <li className="mb-2">
          Admin Address: <span className="font-semibold">{adminAddress}</span>
        </li>
        <li className="mb-2">
          Initial LP Token Deposit:
          <span className="font-semibold">{initialLpTokenDeposit}</span>
        </li>
      </ul>
    </div>
  );
};

export default TokenInfoComponent;
