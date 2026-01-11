import { ethers } from "ethers";

const ensProvider = new ethers.providers.InfuraProvider(
	"mainnet",
	process.env.NEXT_PUBLIC_INFURA_API_KEY
);

const chainProvider = new ethers.providers.JsonRpcProvider(
	process.env.NEXT_PUBLIC_BASE_PROVIDER_URL
);

export const getBalance = async (winery) => {
	try {
		const name = `redeem.${winery}.openvino.eth`;

		const resolvedAddress = await ensProvider.resolveName(name);
		if (!resolvedAddress) throw new Error(`ENS name not resolved: ${name}`);

		const balance = await chainProvider.getBalance(resolvedAddress);
		const ethBalance = ethers.utils.formatEther(balance);
		return ethBalance;
	} catch (error) {
		console.error("Error getting balance:", error);
		throw error;
	}
};
