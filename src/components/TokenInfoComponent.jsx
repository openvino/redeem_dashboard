import React from "react";
import LoadingSpinner from "./Spinner";

const TokenInfoComponent = ({ tokenInfo }) => {
  console.log(tokenInfo);
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
    vcoStartDate,
    vcoEndDate,
    vcoPrice,
    vcoPriceFiat,
    adminAddress,
    initialLpTokenDeposit,
  } = tokenInfo;
  return (
    <div class="p-4 border border-gray-300 rounded-md shadow-md">
      <h1 class="text-2xl font-semibold">Token Information</h1>
      <ul class="grid grid-cols-2 gap-4 mt-4">
        <li class="mb-2">
          Name: <span class="font-semibold">{name}</span>
        </li>
        <li class="mb-2">
          Symbol: <span class="font-semibold">{symbol}</span>
        </li>
        <li class="mb-2">
          Balance: <span class="font-semibold">{balance}</span>
        </li>
        {price > -1 ? (
          <li class="mb-2">
            Price: <span class="font-semibold">{price}</span>
          </li>
        ) : (
          <li class="mb-2">
            Price:{" "}
            <span>
              <div class="mt-2">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

        <li class="mb-2">
          Token Issuance: <span class="font-semibold">{vcoIssuance}</span>
        </li>
        <li class="mb-2">
          Max Total Supply (total bottles remaining):{" "}
          <span class="font-semibold">{totalSupply}</span>
        </li>
        <li class="mb-2">
          Burned tokens (redeemed! Drunk):{" "}
          <span class="font-semibold">{burnedTokens}</span>
        </li>

        {holdersCount > -1 ? (
          <li class="mb-2">
            Holders (drinker wallets):{" "}
            <span class="font-semibold">{holdersCount}</span>
          </li>
        ) : (
          <li class="mb-2">
            Holders (drinker wallets):{" "}
            <span>
              <div class="mt-2">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}
        {totalTransfers > -1 ? (
          <li class="mb-2">
            Total Transfers: <span class="font-semibold">{totalTransfers}</span>
          </li>
        ) : (
          <li class="mb-2">
            Total Transfers:{" "}
            <span>
              <div class="mt-2">
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

        <li class="mb-2">
          Token Contract Address:{" "}
          <span class="font-semibold">{tokenContract}</span>
        </li>
        <li class="mb-2">
          Crowdsale Contract Address:{" "}
          <span class="font-semibold">{crowdsaleContract}</span>
        </li>
        <li class="mb-2">
          LP Contract Address: <span class="font-semibold">{lpContract}</span>
        </li>
        <li class="mb-2">
          VCO Start Date: <span class="font-semibold">{vcoStartDate}</span>
        </li>
        <li class="mb-2">
          VCO End Date: <span class="font-semibold">{vcoEndDate}</span>
        </li>
        <li class="mb-2">
          VCO Price: <span class="font-semibold">{vcoPrice}</span>
        </li>
        <li class="mb-2">
          VCO Price in Fiat (currency selector?):{" "}
          <span class="font-semibold">{vcoPriceFiat}</span>
        </li>
        <li class="mb-2">
          Admin Address: <span class="font-semibold">{adminAddress}</span>
        </li>
        <li class="mb-2">
          Initial LP Token Deposit:{" "}
          <span class="font-semibold">{initialLpTokenDeposit}</span>
        </li>
      </ul>
    </div>
  );
};

export default TokenInfoComponent;
