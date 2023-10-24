import React from 'react';
import LoadingSpinner from './Spinner';

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
    <div>
      <h1>Token Information</h1>
      <ul>
        <li>
          Name: <span>{name}</span>
        </li>
        <li>
          Symbol: <span>{symbol}</span>
        </li>
        <li>
          Balance: <span>{balance}</span>
        </li>
        {price > -1 ? (
          <li>
            Price: <span>{price}</span>
          </li>
        ) : (
          <li>
            Price:{' '}
            <span>
              <div>
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

        <li>
          Token Issuance: <span>{vcoIssuance}</span>
        </li>
        <li>
          Max Total Supply (total bottles remaining):
          <span>{totalSupply}</span>
        </li>
        <li>
          Burned tokens (redeemed! Drunk): <span>{burnedTokens}</span>
        </li>

        {holdersCount > -1 ? (
          <li>
            Holders (drinker wallets): <span>{holdersCount}</span>
          </li>
        ) : (
          <li>
            Holders (drinker wallets):{' '}
            <span>
              <div>
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}
        {totalTransfers > -1 ? (
          <li>
            Total Transfers: <span>{totalTransfers}</span>
          </li>
        ) : (
          <li>
            Total Transfers:{' '}
            <span>
              <div>
                <LoadingSpinner />
              </div>
            </span>
          </li>
        )}

        <li>
          Token Contract Address: <span>{tokenContract}</span>
        </li>
        <li>
          Crowdsale Contract Address: <span>{crowdsaleContract}</span>
        </li>
        <li>
          LP Contract Address: <span>{lpContract}</span>
        </li>
        <li>
          VCO Start Date: <span>{vcoStartDate}</span>
        </li>
        <li>
          VCO End Date: <span>{vcoEndDate}</span>
        </li>
        <li>
          VCO Price: <span>{vcoPrice}</span>
        </li>
        <li>
          VCO Price in Fiat (currency selector?): <span>{vcoPriceFiat}</span>
        </li>
        <li>
          Admin Address: <span>{adminAddress}</span>
        </li>
        <li>
          Initial LP Token Deposit: <span>{initialLpTokenDeposit}</span>
        </li>
      </ul>
    </div>
  );
};

export default TokenInfoComponent;
