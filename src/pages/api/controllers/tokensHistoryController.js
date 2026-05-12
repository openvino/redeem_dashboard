import conn from "../config/db";

export const tokensHistory = async (winary) => {
	try {
		let query = 'SELECT * FROM "tokens_history"';

		if (winary) {
			query += ` WHERE winary = '${winary}'`;
		}

		const users = await conn.query(query);

		if (users.rows.length) return users.rows;
		return [];
	} catch (error) {
		console.log(error);
	}
};

export const tokenStock = async (token, chain) => {
	try {
		let query = 'SELECT * FROM "tokens_history"';
		const conditions = [];

		if (token) {
			conditions.push(`symbol = '${token}'`);
		}
		if (chain) {
			conditions.push(`chain = '${chain}'`);
		}

		if (conditions.length > 0) {
			query += ` WHERE ${conditions.join(" AND ")}`;
		}

		const users = await conn.query(query);

		if (users.rows.length) return users.rows;
		return [];
	} catch (error) {
		console.log(error);
	}
};

export const updateTokenHistory = async ({ symbol, chain, updates }) => {
	if (!symbol) {
		throw new Error("Token symbol is required");
	}

	const allowedColumns = new Set([
		"bottles_stock",
		"pending_redeems",
		"last_data_cid",
		"reserve_addresses",
	]);

	const setFragments = [];
	const values = [];
	let argIndex = 1;

	for (const [column, value] of Object.entries(updates ?? {})) {
		if (!allowedColumns.has(column)) continue;
		setFragments.push(`${column} = $${argIndex}`);
		values.push(value);
		argIndex += 1;
	}

	if (setFragments.length === 0) {
		const existing = await tokenStock(symbol, chain);
		return existing?.[0] ?? null;
	}

	let query = `UPDATE "tokens_history" SET ${setFragments.join(", ")} WHERE symbol = $${argIndex}`;
	values.push(symbol);
	argIndex += 1;

	if (chain) {
		query += ` AND chain = $${argIndex}`;
		values.push(chain);
	}

	query += " RETURNING *";

	const result = await conn.query(query, values);
	return result.rows?.[0] ?? null;
};
