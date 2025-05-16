import { getToken, jwt } from 'next-auth/jwt';
import {
  getAllRedeems,
  getRedeems,
  updateRedeemStatus,
} from '../controllers/redeemsController';
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
        const redeems = await getAllRedeems();

        return res.status(200).json(redeems);
      } else {
        const redeems = await getRedeems(token.sub);
        return res.status(200).json(redeems);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updateRedeem = await updateRedeemStatus(req.body.data);
      return res.status(200).json(updateRedeem);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
}
