import clientAxios from "@/config/clientAxios";

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

		console.log(response.data);

		return response.data;
	} catch (error) {
		console.error(error);
	}
};
export const getAllLaunchingTokens = async () => {
	console.log("tokensLaunchingAll");

	try {
		const response = await clientAxios.get(`/tokensLaunchAll`, {});

		console.log(response.data);

		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const updateTokenInfo = async (symbol, tokenFields) => {
	console.log({ id: symbol, ...tokenFields });

	try {
		const response = await clientAxios.patch(`/tokensLaunchRoute`, {
			params: { id: symbol, ...tokenFields },
		});

		console.log(response.data);

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
		redeemWalletAddress: tokenFields.redeemWalletAddress,
		tokenImage: tokenFields.tokenImage,
		walletAddress: tokenFields.walletAddress,
		rate: tokenFields.rate,
		openingTime: tokenFields.openingTime,
		closingTime: tokenFields.closingTime,
		tokensToCrowdsale: tokenFields.tokensToCrowdsale,
		token_address: "",
		crowdsale_address: "",
		winery_id: tokenFields.winery_id,
	};

	console.log(payload);

	try {
		const response = await clientAxios.post(`/tokensLaunchRoute`, {
			params: payload,
		});

		setToken(response.data);

		return response.data;
	} catch (error) {
		console.error(error);
	}
};
