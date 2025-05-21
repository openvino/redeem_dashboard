import conn from "../config/db";

export async function getCountries() {
    const countries = await conn.query("SELECT country_id, place_description FROM shipping_costs_clone WHERE province_id = '' AND country_id <> '' ORDER BY country_id ASC;")

    if(countries.rows.length) {
        return countries.rows
    }
}

export async function getProvinces() {
    const provinces = await conn.query("SELECT province_id, place_description FROM shipping_costs_clone WHERE country_id = '' AND province_id <> ''; ")

    if(provinces.rows.length) {
        return provinces.rows
    }
}