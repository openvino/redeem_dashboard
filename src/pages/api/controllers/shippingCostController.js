import conn from '../config/db';

export const getShippingCost = async (body) => {
    const { token, province_id, amount } = body;
    let query = `SELECT * FROM ${token.toLowerCase()}_shipping_cost WHERE province_id = '${province_id}'`;
    const { rows } = await conn.query(query);

    if (rows.length > 0) {
        const amountParsed = parseInt(amount, 10);
        const amountValidated = Math.max(amountParsed, 6);
        const cost = rows[0];
        const costReturn = {
            cost: Math.round(((cost.base_cost * amountValidated / 6.0) + (cost.cost_per_unit * amountValidated)) * 100) / 100,
        };
        return costReturn;
    } else {
        throw new Error('Cost not found');
    }
};
