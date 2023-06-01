import conn from "../config/db";

export async function checkAuth(publick_key)  {
    const winery = await conn.query(`SELECT * FROM wineries WHERE PUBLIC_KEY='${publick_key}';`)
    if(winery.rows.length) {
        return true
    } else {
        return false
    }
}