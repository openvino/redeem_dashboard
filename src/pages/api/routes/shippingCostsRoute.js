import { getShippingCost } from "../controllers/shippingCostController";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const shippingCost = await getShippingCost(req.query);
            return res.status(200).json(shippingCost)
        } catch (error) {
            return res.status(400).json(error.message)
        }
    }
}