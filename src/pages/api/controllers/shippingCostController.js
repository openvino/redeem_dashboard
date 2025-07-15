import conn from '../config/db';

export const getShippingCost = async (body) => {
    const { token, province_id, amount } = body;

    const query = `
        SELECT * FROM token_shipping_cost
        WHERE token_id = $1 AND province_id = $2
        LIMIT 1
    `;

    const { rows } = await conn.query(query, [token.toLowerCase(), province_id]);

    if (rows.length === 0) {
        throw new Error('Cost not found');
    }

    const cost = rows[0];
    const amountParsed = parseInt(amount, 10);
    const amountValidated = Math.max(amountParsed, 6);

    const totalCost = Math.round((
        (cost.base_cost * amountValidated / 6.0) +
        (cost.cost_per_unit * amountValidated)
    ) * 100) / 100;

    return { cost: totalCost };
};
