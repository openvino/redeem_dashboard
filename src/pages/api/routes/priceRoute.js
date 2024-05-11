import axios from "axios"

import validateRequest from '../helpers/validateRequest';

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3002");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
      
    const isValidApiRequest = await validateRequest(req);

    if (!isValidApiRequest) {
      return res.status(401).json("INVALID CREDENTIALS");
    }
  
    try {
    const {from, to} = req.query;
    console.log(from, to);
    const url = `${cmktUrl}?from=${from}&to=${to}`
    console.log(url);
    const response = await axios.get(`${cmktUrl}?from=${from}&to=${to}`);
    const price = response.data;
    console.log(price);
    res.status(200).json({ pair: `${from}-${to}`, data: price });
  } catch (error) {
    console.error('Error al obtener el precio:', error);
    res.status(500).json({ message: 'Error al obtener el precio' });
  }

}
