import conn from "../config/db";

export async function getPlatformSettings() {
  const { rows } = await conn.query(`SELECT * FROM platform_settings LIMIT 1`);
  return rows[0] ?? { common_description: {} };
}

export async function updatePlatformSettings({ common_description }) {
  await conn.query(
    `UPDATE platform_settings SET common_description = $1 WHERE id = 1`,
    [common_description]
  );
}
