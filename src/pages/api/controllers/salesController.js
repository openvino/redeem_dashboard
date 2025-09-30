import conn from "../config/db";

export const getSales = async ({ from, to, winery }) => {
	let query = `
        SELECT * FROM sales
    `;
	const params = [];
	if (from && to) {
		query += ` WHERE created_at BETWEEN $1 AND $2`;
		params.push(from, to);
		if (winery) {
			query += ` AND winerie_id = $3`;
			params.push(winery);
		}
	}
	query += ` ORDER BY id ASC`;

	const { rows } = await conn.query(query, params);

	if (rows.length === 0) {
		throw new Error("No sales found");
	}

	const sales = rows;
	return { sales };
};
