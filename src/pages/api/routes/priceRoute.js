import axios from 'axios';

import validateRequest from '../helpers/validateRequest';

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;

export default async function handler(req, res) {
    const {from, to} = req.query;
    
    const isValidApiRequest = await validateRequest(req);

    if (!isValidApiRequest) {
      return res.status(401).json("INVALID CREDENTIALS");
    }
 

  axios.get(`${cmktUrl}?from=${from}&to=${to}`)

    .then(response => {
 
      const price = response.data;
      
      res.status(200).json({ pair: `${from}-${to}`, data: price });
    })
    .catch(error => {

      console.error('Error al obtener el precio:', error);
      res.status(500).json({ message: 'Error al obtener el precio' });
    });
}
