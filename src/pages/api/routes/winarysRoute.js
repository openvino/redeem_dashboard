import { getToken, jwt } from 'next-auth/jwt';
import {
  getAllWinarys,
  updateWinary,
  createWinary,
} from '../controllers/winarysController';
import tokenVerify from '../helpers/tokenVerify';

export default async function handler(req, res) {
  const secret = process.env.JWT_SECRET;

  const isValidJWT = await tokenVerify(req);
  if (!isValidJWT) {
    return res.json('INVALID CREDENTIALS');
  }

  if (req.method === 'GET') {
    const { is_admin } = req.query;

    try {
      const token = await getToken({ req, secret });

      if (is_admin === 'true') {
        const winarys = await getAllWinarys();
        return res.status(200).json(winarys);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updatedWinary = await updateWinary(req.body.data);
      return res.status(200).json(updatedWinary);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const updateWinary = await createWinary(req.body.data);
      return res.status(200).json(updateWinary);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
}
