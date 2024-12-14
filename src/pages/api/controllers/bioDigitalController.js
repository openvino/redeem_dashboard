import { v4 as uuidv4 } from "uuid";
import conn from "../config/db";

export const createWineBiodigitalData = async ({
	wine,
	winery,
	copper,
	cadmium,
	arsenic,
	zinc,
	lead,
	match_inv_data,
	organic,
	privates,
}) => {
	try {
		if (!wine || !winery) {
			throw new Error("Wine and Winery fields are required");
		}

		const query = `
      INSERT INTO "biodigital_data" (
        id, wine, winery, copper, cadmium, arsenic, zinc, lead, match_inv_data, organic, privates
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11)
      RETURNING *;
    `;

		const id = uuidv4();
		const values = [
			id,
			wine,
			winery,
			copper,
			cadmium,
			arsenic,
			zinc,
			lead,
			match_inv_data,
			organic,
			privates,
		];

		console.log("Inserting values:", values);

		const result = await conn.query(query, values);

		if (result.rows.length) {
			return result.rows[0];
		} else {
			throw new Error("Wine Biodigital Data creation failed");
		}
	} catch (error) {
		console.error("Error creating Wine Biodigital Data:", {
			values,
			error: error.message,
		});
		throw error;
	}
};

export const getWinesBiodigitalData = async () => {
	try {
		let query = 'SELECT * FROM "biodigital_data"';

		const wines = await conn.query(query);

		if (wines.rows.length) return wines.rows;
	} catch (error) {
		console.log(error);
	}
};
export const getWineBiodigitalData = async ({ wine }) => {
	try {
		const query = 'SELECT * FROM "biodigital_data" WHERE wine = $1';

		const result = await conn.query(query, [wine]);

		if (result.rows.length) {
			return result.rows[0];
		} else {
			throw new Error(`No wine found named: ${wine}`);
		}
	} catch (error) {
		console.error("Error retrieving Wine Biodigital Data:", error);
		throw error;
	}
};

export const updateWineBiodigitalData = async ({ wine, field, value }) => {
	try {
		if (!wine || !field) {
			throw new Error("Wine and field are required");
		}

		const allowedFields = [
			"wine",
			"winery",
			"copper",
			"cadmium",
			"arsenic",
			"zinc",
			"lead",
			"match_inv_data",
			"organic",
			"privates",
		];

		if (!allowedFields.includes(field)) {
			throw new Error(`Invalid field: ${field}`);
		}

		const query = `
      UPDATE "biodigital_data" 
      SET ${field} = $1 
      WHERE wine = $2 
      RETURNING *;
    `;

		const values = [value, wine];

		console.log(
			"Updating field:",
			field,
			"with value:",
			value,
			"for wine:",
			wine
		);

		const result = await conn.query(query, values);

		if (result.rows.length) {
			return result.rows[0];
		} else {
			throw new Error(`No wine found with name: ${wine}`);
		}
	} catch (error) {
		console.error("Error updating Wine Biodigital Data:", error);
		throw error;
	}
};
