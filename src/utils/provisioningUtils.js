import clientAxios from "@/config/clientAxios";

export const DEFAULT_VALUES = {
	id: "",
	name: "",
	symbol: "",
	cap: "",
	redeem_wallet_address: "",
	vintage: "esker",
	bottle_image: "",
	token_image: "",
	winery_id: "",
	description: "",
	wallet_address: "",
	price_per_token: "",
	rate: "",
	opening_time: "",
	closing_time: "",
	tokens_to_crowdsale: "",
	token_address: "",
	crowdsale_address: "",
};

export const tokensLaunching = async (winery_id) => {
	console.log(winery_id);

	try {
		const response = await clientAxios.get(`/tokensLaunchRoute`, {
			params: { winery_id },
		});

		console.log(response.data);

		return response.data;
	} catch (error) {
		console.error(error);
	}
};
export const tokenLaunching = async (id) => {
	try {
		const response = await clientAxios.get(`/tokenLaunchRoute`, {
			params: { id },
		});
		return response.data;
	} catch (error) {
		console.error(error);
	}
};
export const getAllLaunchingTokens = async () => {
	try {
		const response = await clientAxios.get(`/tokensLaunchAll`, {});
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const updateTokenInfo = async (symbol, tokenFields) => {
	try {
		const response = await clientAxios.patch(`/tokensLaunchRoute`, {
			params: { id: symbol, ...tokenFields },
		});

		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const createTokenForLaunch = async (symbol, tokenFields) => {
	const payload = {
		id: symbol,
		name: tokenFields.name,
		symbol: tokenFields.symbol,
		cap: tokenFields.cap,
		redeem_wallet_address: tokenFields.redeemWalletAddress,
		vintage: tokenFields.vintage,
		bottle_image: tokenFields.bottleImage,
		token_image: tokenFields.tokenImage,
		winery_id: tokenFields.winery_id,
		description: tokenFields.description,
		wallet_address: tokenFields.walletAddress,
		price_per_token: tokenFields.pricePerToken,
		rate: tokenFields.rate,
		opening_time: tokenFields.openingTime,
		closing_time: tokenFields.closingTime,
		tokens_to_crowdsale: tokenFields.tokensToCrowdsale,
		token_address: "",
		crowdsale_address: "",
	};

	try {
		const response = await clientAxios.post(`/tokensLaunchRoute`, {
			params: payload,
		});

		return response.data;
	} catch (error) {
		console.error(error);
	}
};
