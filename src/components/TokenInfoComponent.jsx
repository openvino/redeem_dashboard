import React, { useEffect, useState } from "react";
import LoadingSpinner from "./Spinner";
import axios from "axios";
const TokenInfoComponent = ({ tokenInfo }) => {
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

  const [priceFiat, setPriceFiat] = useState();

  const getPrice = async (ethAmount) => {
    try {
      const response = await axios.get(
        "https://criptoya.com/api/bitsoalpha/eth/usd"
      );

      if (response.data && response.data.ask) {
        const ethPriceInUSD = response.data.totalAsk;
        const priceInUSD = ethAmount * ethPriceInUSD;
        console.log(priceInUSD);
        setPriceFiat(priceInUSD);
        return;
      } else {
        console.log("No se pudo obtener el precio de Ethereum en dólares");
        return null;
      }
    } catch (error) {
      console.error(
        "Error al obtener el precio de Ethereum en dólares:",
        error
      );
      return null;
    }
  };

  useEffect(() => {
    const price = VCOPrices.find((element) => element.name === name)?.priceEth;

    getPrice(price);
  }, [name]);

  const VCOPrices = [
    {
      name: "MikeTangoBravo19",
      tokenInssuance: 17.707,
      priceEth: 0.027778,
      dateStart: "6 - MAY - 2019 ",
      dateEnd: "25 - JULY - 2019",
    },

    {
      name: "MikeTangoBravo20",
      tokenInssuance: 9.6,
      priceEth: 0.013698630136986302,
      dateStart: "6 - MAY - 2020 ",
      dateEnd: "25 - JULY - 2020",
    },
    {
      name: "MikeTangoBravo21",
      tokenInssuance: 12.121,
      priceEth: 0.00081168831168831169,
      dateStart: "6 - MAY - 2021 ",
      dateEnd: "25 - JULY - 2021",
    },
    {
      name: "MikeTangoBravo22",
      tokenInssuance: 8.192,
      priceEth: 0.001590792453454557,
      dateStart: "6 - MAY - 2022 ",
      dateEnd: "25 - JULY - 2022",
    },
    {
      name: "MikeTangoBravo23",
      tokenInssuance: 1.024,
      priceEth: 0.006896551724137932,
      dateStart: "6 - MAY - 2023 ",
      dateEnd: "25 - JULY - 2023",
    },
  ];

  return (
    <div className="p-4 border border-[#840C4A] rounded-md  bg-[#F1EDE2]">
      <ul className="grid grid-cols-2 text-cennter gap-4 mt-4">
        <li className="mb-2">
          Name: <span className="font-semibold">{name}</span>
        </li>
        <li className="mb-2">
          Symbol: <span className="font-semibold">{symbol}</span>
        </li>
        <li className="mb-2">
          Balance: <span className="font-semibold">{balance}</span>
        </li>
        {price > -1 ? (
          <li className="mb-2">
            Price: <span className="font-semibold">{price}</span>
          </li>
        ) : (
          <li className="mb-2">
            Price:
            <span>
              <div className="mt-2">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

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

        {holdersCount > -1 ? (
          <li className="mb-2">
            Holders (drinker wallets):
            <span className="font-semibold">{holdersCount}</span>
          </li>
        ) : (
          <li className="mb-2">
            Holders (drinker wallets):
            <span>
              <div className="mt-2">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}
        {totalTransfers > -1 ? (
          <li className="mb-2">
            Total Transfers:
            <span className="font-semibold">{totalTransfers}</span>
          </li>
        ) : (
          <li className="mb-2">
            Total Transfers:
            <span>
              <div className="mt-2">
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
          VCO Start Date:{" "}
          <span className="font-semibold">
            {VCOPrices.map((element, index) => {
              if (name == element.name) return `${element.dateStart}`;
            })}
          </span>
        </li>
        <li className="mb-2">
          VCO End Date:{" "}
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
          VCO Price in Fiat:
          {` $ ${priceFiat} USD`}
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
