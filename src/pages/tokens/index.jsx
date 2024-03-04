const { ethers } = require('ethers');
import { useEffect, useState } from 'react';
import TokenInfoComponent from '@/components/TokenInfoComponent';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import { MTB18Address, MTB18_ETH_PAIR } from '../../../contracts';
import useTokenInformation from '@/hooks/useTokenInformation';
import Loader from '@/components/Loader';
import LoadingSpinner from '@/components/Spinner';
import {
  closeNotification,
  showNotification,
} from '@/redux/actions/notificationActions';

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
    <>
      <Topbar />
      <Sidebar />
      <div className="z-1 mt-[8rem]  ml-[4.5rem] sm:ml-[6rem] w-[80%] md:w-[90%] overflow-x-hidden rounded-xl">
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
    </>
  );
};

export default Tokens;
