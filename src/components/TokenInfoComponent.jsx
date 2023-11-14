import React, { useEffect, useState } from 'react';
import LoadingSpinner from './Spinner';
import axios from 'axios';
import Image from 'next/image';
import { VCOPrices, contracts } from '../../contracts';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const TokenInfoComponent = ({ tokenInfo, onSelectChange }) => {
  const { t } = useTranslation();
  const {
    name,
    symbol,
    vcoIssuance,
    totalSupply,
    burnedTokens,
    holdersCount,
    totalTransfers,
    tokenContract,
    uniswapUri,
    crowdsaleAddress,
    lpContractAddress,
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
    <div
      className="p-4 border rounded-xl bg-[#F1EDE2] flex flex-col justify-center"
      // style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="flex flex-row justify-between">
        <div className="text-center flex">
          <Image
            src={`/assets/${symbol}.png`}
            width={50}
            height={40}
            alt="mtb23"
          />
          <h1 className="text-md md:text-xl font-bold m-2">
            {t('token_info')}
          </h1>
        </div>
        <div className="flex justify-end gap-5 my-1 mr-10">
          <select
            name=""
            id=""
            onChange={onSelectChange}
            className="text-gray-800 border rounded-lg text-md "
            style={{ outline: 'none' }}
          >
            <option value="">{t('select_token')}</option>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-3">
        {/* First Column */}
        <div className="grid grid-cols-1  gap-2">
          <div className="mb-2">
            {t('name')}
            {':   '} <span className="font-semibold">{name}</span>
          </div>

          <div className="mb-2">
            {t('symbol')}: <span className="font-semibold">{symbol}</span>
          </div>
          <div className="mb-2">
            {t('token_issuance')}:{' '}
            <span className="font-semibold">{vcoIssuance}</span>
          </div>
          <div className="mb-2">
            {t('burned_tokens')}:{'   '}
            <span className="font-semibold">{burnedTokens}</span>
          </div>
          {/* <div className="mb-2">
          Price: <span className="font-semibold">{price}</span>
        </div> */}
          <div>
            {t('bottles_remaining')}:
            <span className="font-semibold">{totalSupply}</span>
          </div>
          <div>
            {t('total_transfers')}:
            <span className="font-semibold">{totalTransfers}</span>
          </div>
          <div>
            {t('holders')}:<span className="font-semibold">{holdersCount}</span>
          </div>
        </div>

        {/* Second Column */}
        <div className="grid grid-cols-1  gap-2">
          <div className="mb-2">
            {t('contract_address')}:{'   '}
            <span className="font-semibold">{tokenContract}</span>
          </div>
          <div className="mb-2">
            {t('crowdsale_address')}:{'   '}
            <span className="font-semibold">{crowdsaleAddress}</span>
          </div>
          <div className="mb-2">
            {t('lp')} {':    '}
            <span className="font-semibold">{lpContractAddress}</span>
          </div>
          <div>
            {t('vco_start')}:{'   '}
            <span className="font-semibold">
              {VCOPrices.map((element, index) => {
                if (name == element.name) return `${element.dateStart}`;
              })}
            </span>
          </div>
          <div>
            {t('vco_end')}:{'   '}
            <span className="font-semibold">
              {VCOPrices.map((element, index) => {
                if (name == element.name) return `${element.dateEnd}`;
              })}
            </span>
          </div>
          <div>
            {t('vco_price')}:{'   '}
            <span className="font-semibold">
              {VCOPrices.map((element, index) => {
                if (name == element.name) return `${element.priceEth} ETH`;
              })}
            </span>
          </div>
          <div>
            <span className="flex flex-row">
              <div>
                {t('vco_price_fiat')}:{'   '}
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
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 mr-8">
        <Link href={uniswapUri || ''} target="blank">
          <button className="px-2 py-1 rounded bg-[#840C4A] text-white  w-30">
            {/* {t('add_admin')} */}
            More Info...
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TokenInfoComponent;
