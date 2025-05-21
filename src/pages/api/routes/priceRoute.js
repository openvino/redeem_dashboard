import axios from "axios";

import validateRequest from "../helpers/validateRequest";

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;
const url = process.env.NEXT_PUBLIC_EXCHANGE_URL;
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
    const { from, to } = req.query;
    const url = `${cmktUrl}?from=${from}&to=${to}`;
    const response = await axios.get(`${cmktUrl}?from=${from}&to=${to}`);
    const price = response.data;
    res.status(200).json({ pair: `${from}-${to}`, data: price });
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    res.status(500).json({ message: "Error al obtener el precio" });
  }
}
