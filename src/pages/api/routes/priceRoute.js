import axios from "axios";

import validateRequest from "../helpers/validateRequest";

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;

const REQUEST_TIMEOUT_MS = 8000;

async function fetchFromCryptoMkt(from, to) {
  if (!cmktUrl) {
    throw new Error("CryptoMKT URL is not configured");
  }

  const response = await axios.get(`${cmktUrl}?from=${from}&to=${to}`, {
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
    },
  });

  return {
    provider: "cryptomkt",
    data: response.data,
  };
}

async function fetchFromCoinbase(from, to) {
  const response = await axios.get(
    `https://api.coinbase.com/v2/prices/${from}-${to}/spot`,
    {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Accept: "application/json",
      },
    }
  );

  const amount = response?.data?.data?.amount;
  if (!amount) {
    throw new Error("Coinbase returned no price");
  }

  return {
    provider: "coinbase",
    data: {
      [from]: {
        currency: to,
        price: amount,
        timestamp: new Date().toISOString(),
      },
    },
  };
}

async function fetchFromBinance(from, to) {
  const response = await axios.get(
    `https://api.binance.com/api/v3/ticker/price?symbol=${from}${to}`,
    {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Accept: "application/json",
      },
    }
  );

  const price = response?.data?.price;
  if (!price) {
    throw new Error("Binance returned no price");
  }

  return {
    provider: "binance",
    data: {
      [from]: {
        currency: to,
        price,
        timestamp: new Date().toISOString(),
      },
    },
  };
}

function buildProviderError(provider, error) {
  return {
    provider,
    status: error?.response?.status || null,
    message:
      error?.response?.data?.error?.message ||
      error?.response?.statusText ||
      error?.message ||
      "Unknown error",
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const isValidApiRequest = await validateRequest(req);

  if (!isValidApiRequest) {
    return res.status(401).json("INVALID CREDENTIALS");
  }

  try {
    const from = String(req.query.from || "").trim().toUpperCase();
    const to = String(req.query.to || "").trim().toUpperCase();

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "Missing required query params: from and to" });
    }

    const providerErrors = [];

    try {
      const result = await fetchFromCryptoMkt(from, to);
      return res
        .status(200)
        .json({ pair: `${from}-${to}`, provider: result.provider, data: result.data });
    } catch (error) {
      providerErrors.push(buildProviderError("cryptomkt", error));
    }

    try {
      const result = await fetchFromCoinbase(from, to);
      return res
        .status(200)
        .json({ pair: `${from}-${to}`, provider: result.provider, data: result.data });
    } catch (error) {
      providerErrors.push(buildProviderError("coinbase", error));
    }

    try {
      const result = await fetchFromBinance(from, to);
      return res
        .status(200)
        .json({ pair: `${from}-${to}`, provider: result.provider, data: result.data });
    } catch (error) {
      providerErrors.push(buildProviderError("binance", error));
    }

    console.error("All price providers failed", providerErrors);
    return res.status(502).json({
      message: "No price provider returned a valid response",
      errors: providerErrors,
    });
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).json({ message: "Error al obtener el precio" });
  }
}
