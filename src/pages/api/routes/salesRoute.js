import { getSales } from "../controllers/salesController";

export default async function handler(req, res) {
	console.log("salesRouteeeeeeeeeeeeee");

	if (req.method === "GET") {
		console.log("GEEEET");

		try {
			const sales = await getSales(req.query);
			console.log("sales", sales);

			return res.status(200).json(sales);
		} catch (error) {
			return res.status(400).json(error.message);
		}
	}
}
