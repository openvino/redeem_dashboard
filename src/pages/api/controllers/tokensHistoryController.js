import conn from "../config/db";

export const tokensHistory = async (winary) => {
	try {
		let query = 'SELECT * FROM "tokens_history"';

		if (winary) {
			query += ` WHERE winary = '${winary}'`;
		}

		const users = await conn.query(query);

		if (users.rows.length) return users.rows;
	} catch (error) {
		console.log(error);
	}
};

export const tokenStock = async (token, chain) => {
	try {
		let query = 'SELECT * FROM "tokens_history"';

		if (token) {
			query += ` WHERE symbol = '${token}' AND chain = '${chain}'`;
		}

		const users = await conn.query(query);

		if (users.rows.length) return users.rows;
	} catch (error) {
		console.log(error);
	}
};
