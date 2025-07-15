import { useState } from 'react';
import TokenInfoComponent from '@/components/TokenInfoComponent';
import { MTB18Address, MTB18_ETH_PAIR } from '../../../contracts';
import useTokenInformation from '@/hooks/useTokenInformation';
import LoadingSpinner from '@/components/Spinner';

import HomeLayout from '@/components/HomeLayout';

const Tokens = () => {
  const [address, setAddress] = useState(MTB18Address);
  const [pairAddress, setPairAddress] = useState(MTB18_ETH_PAIR);
  const { tokenInfo, loading } = useTokenInformation(address, pairAddress);

  const onSelectChange = (e) => {
    const selectedContractAddress = e.target.value;
    const selectedContractName =
      e.target.options[e.target.selectedIndex].getAttribute('name');

    setAddress(selectedContractAddress);
    setPairAddress(selectedContractName);
  };

  return (
   <HomeLayout>
 
      <div className="z-1 rounded-xl">
        {tokenInfo && !loading ? (
          <div className="w-full flex justify-start ml-5 overflow-x-hidden">
            <TokenInfoComponent
              tokenInfo={tokenInfo}
              onSelectChange={onSelectChange}
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
