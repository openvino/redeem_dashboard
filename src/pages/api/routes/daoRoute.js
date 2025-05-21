import { createProposal, getAllProposals } from "../controllers/daoControllers";

export default async function handler(req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Authorization, Content-Type, X-API-Secret"
	);

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	const providedSecret = req.headers["x-api-secret"];
	if (providedSecret !== process.env.API_SECRET) {
		return res
			.status(401)
			.json({ message: "Unauthorized: Invalid API secret" });
	}

	try {
		if (req.method === "GET") {
			console.log("GET /proposals called");
			const proposals = await getAllProposals();
			return res.status(200).json(proposals);
		}

		if (req.method === "POST") {
			console.log("POST /proposals called");
			const newProposal = await createProposal(req); // usa req.body
			return res
				.status(201)
				.json({ message: "Proposal created", result: newProposal });
		}

		return res.status(405).json({ message: "Method Not Allowed" });
	} catch (error) {
		console.error(`${req.method} /proposals error:`, error);
		return res.status(500).json({ message: error.message });
	}
}
