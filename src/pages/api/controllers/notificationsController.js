import conn from "../config/db";


export async function setWatchedTrue(id) {

    const redeem = await conn.query(`UPDATE redeem_infos SET watched = true WHERE id = '${id}'`);

}