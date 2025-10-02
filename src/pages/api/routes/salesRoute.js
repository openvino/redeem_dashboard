import { getSales } from "../controllers/salesController";

export default async function handler(req, res) {
	if (req.method === "GET") {
		try {
			const sales = await getSales(req.query);
			console.log("sales", sales);

			return res.status(200).json(sales);
		} catch (error) {
			return res.status(400).json(error.message);
		}
	}
}
