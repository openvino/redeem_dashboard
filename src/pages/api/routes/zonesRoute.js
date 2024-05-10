import axios from 'axios';

import validateRequest from '../helpers/validateRequest';
import { getCountries, getProvinces } from '../controllers/countriesController';


const url = 'https://api.exchange.cryptomkt.com/api/3/public/price/rate?from=ETH&to=DAI';

export default async function handler(req, res) {
    const isVelidApiRequest = await validateRequest(req);

    if (!isVelidApiRequest) {
      return res.status(401).json("INVALID CREDENTIALS");
    }
 
const countries = await getCountries();
const provinces = await getProvinces();

const zones = { countries, provinces }



res.status(200).json(zones.provinces);
  
}
