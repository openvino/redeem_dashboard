import conn from "../config/db";

const resolveENS = require("../../../utils/resolveENS");
let pkOrENS, ens; // ENS or not

export const getAllProposals = async (token) => {
	let query = `SELECT * from proposals`;

	const proposals = await conn.query(query);

	if (proposals.rows.length > 0) {
		return proposals.rows;
	} else {
		throw new Error("No proposals");
	}
};

export const createProposal = async (req) => {
	try {
		const { id, block } = req.body;

		if (!id || !block) {
			throw new Error("Missing required fields: id or block");
		}

		const query = `
			INSERT INTO proposals (id, block)
			VALUES ($1, $2)
		`;

		const values = [id, block];
		const result = await conn.query(query, values);

		return result.rows[0] ?? { success: true };
	} catch (error) {
		console.error("Error creating proposal:", error);
		throw error;
	}
};
