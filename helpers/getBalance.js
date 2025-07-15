import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
	process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL
);

const walletAddress = "0xe613faf5fa44f019e3a3af5927baa6b13643ba53";

export const getBalance = () => {
	return provider
		.getBalance(walletAddress)
		.then((balance) => {
			const ethBalance = ethers.utils.formatEther(balance);
			return ethBalance;
		})
		.catch((error) => {
			console.error("Error getting balance:", error);
			throw error;
		});
};
