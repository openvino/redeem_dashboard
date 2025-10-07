import { useState } from "react";
import TokenInfoComponent from "@/components/TokenInfoComponent";
import { contracts } from "../../../contracts";
import useTokenInformation from "@/hooks/useTokenInformation";
import LoadingSpinner from "@/components/Spinner";

import HomeLayout from "@/components/HomeLayout";

const Tokens = () => {
	const defaultContract = contracts[0] ?? null;
	const [selectedContract, setSelectedContract] = useState(defaultContract);
	const { tokenInfo, loading, pairHistoryApiData } =
		useTokenInformation(selectedContract);

	const onSelectChange = (event) => {
		const selectedAddress = event.target.value;
		const found = contracts.find(
			(entry) => entry.contractAddress === selectedAddress
		);
		if (found) {
			setSelectedContract(found);
		}
	};

	return (
		<HomeLayout>
			<div className="z-1 rounded-xl">
				{tokenInfo && !loading ? (
					<div className="w-full flex justify-start ml-5 overflow-x-hidden">
						<TokenInfoComponent
							tokenInfo={tokenInfo}
							pairHistory={pairHistoryApiData}
							onSelectChange={onSelectChange}
							selectedContractAddress={
								selectedContract?.contractAddress || null
							}
							style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
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
