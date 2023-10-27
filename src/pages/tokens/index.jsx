const { ethers } = require("ethers");
import { useEffect, useState } from "react";

import TokenInfoComponent from "@/components/TokenInfoComponent";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { MTB19Address, MTB19_ETH_PAIR } from "../../../contracts";
import useTokenInformation from "@/hooks/useTokenInformation";
import Loader from "@/components/Loader";
import LoadingSpinner from "@/components/Spinner";

const Tokens = () => {
  const [address, setAddress] = useState(MTB19Address);
  const [pairAddress, setPairAddress] = useState(MTB19_ETH_PAIR);
  const { contracts, tokenInfo, loading } = useTokenInformation(
    address,
    pairAddress
  );

  return (
    <>
      <Topbar />
      <Sidebar />
      <div className="z-1 mt-[10rem] ml-[6rem] w-[90%] overflow-x-scrolllg: overflow-x-hidden">
        <div className="text-center">
          <h1 className="text-xl font-bold">Token info</h1>
        </div>

        <div className="flex justify-end gap-5 my-2">
          <label htmlFor="">Seleccione el token</label>

          <select
            name=""
            id=""
            onChange={(e) => {
              const selectedContractAddress = e.target.value;
              const selectedContractName =
                e.target.options[e.target.selectedIndex].getAttribute("name");

              setAddress(selectedContractAddress);
              setPairAddress(selectedContractName);
            }}
          >
            <option value="">--Seleccione una opcion --</option>
            {contracts.map((e, index) => (
              <option
                key={index}
                value={e.contractAddress}
                name={e.contractPairAddress}
              >
                {e.name}
              </option> // Asigna el valor del token
            ))}
          </select>
        </div>

        {tokenInfo && !loading ? (
          <TokenInfoComponent tokenInfo={tokenInfo} />
        ) : (
          <div className="w-full flex justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </>
  );
};

export default Tokens;
