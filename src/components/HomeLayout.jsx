import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useActiveAccount } from "thirdweb/react";
import { chain as desiredChain } from "@/config/thirdwebClient";

const HomeLayout = ({ children }) => {
	const account = useActiveAccount();

	useEffect(() => {
		const switchToDesiredChain = async () => {
			if (!account || !window.ethereum) return;

			const currentChainId = await window.ethereum.request({
				method: "eth_chainId",
			});

			if (parseInt(currentChainId, 16) !== desiredChain.id) {
				await window.ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: `0x${desiredChain.id.toString(16)}` }],
				});
			}
		};

		switchToDesiredChain();
	}, [account]);

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex flex-col flex-1">
				<Topbar />
				<main className="p-4">{children}</main>
			</div>
		</div>
	);
};

export default HomeLayout;
