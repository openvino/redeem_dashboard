import { useState } from 'react';
import TokenInfoComponent from '@/components/TokenInfoComponent';
import { contracts } from '../../../contracts';
import useTokenInformation from '@/hooks/useTokenInformation';
import LoadingSpinner from '@/components/Spinner';

import HomeLayout from '@/components/HomeLayout';

const Tokens = () => {
  const defaultContract = contracts[0] ?? {};
  const [address, setAddress] = useState(defaultContract.contractAddress ?? '');
  const [pairAddress, setPairAddress] = useState(
    defaultContract.contractPairAddress ?? ''
  );
  const {
    tokenInfo,
    loading,
    holdersDetail,
    getTokensSoldBetweenDates,
    getTokensSoldForYear,
    tokensSoldDuringVco,
    knownAddresses,
  } = useTokenInformation(address, pairAddress);

  const onSelectChange = (e) => {
    const selectedContractAddress = e.target.value;
    const selectedContractName =
      e.target.options[e.target.selectedIndex].getAttribute('name');

    setAddress(selectedContractAddress);
    setPairAddress(selectedContractName ?? '');
  };

  return (
    <HomeLayout>
      <div className="z-1 rounded-xl">
        {tokenInfo && !loading ? (
          <div className="w-full flex justify-start ml-5 overflow-x-hidden">
            <TokenInfoComponent
              tokenInfo={tokenInfo}
              onSelectChange={onSelectChange}
              holdersDetail={holdersDetail}
              onQueryTokensByRange={getTokensSoldBetweenDates}
              onQueryTokensByYear={getTokensSoldForYear}
              onQueryTokensDuringVco={tokensSoldDuringVco}
              knownAddresses={knownAddresses}
              style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
        ) : (
          <div className="w-full flex justify-center overflow-hidden pt-[15%]">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default Tokens;
