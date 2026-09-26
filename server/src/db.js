import mysql from "mysql2/promise";

const configured = Boolean(
  process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER,
);
const pool = configured
  ? mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    })
  : null;

export const databaseConfigured = configured;
export async function query(sql, params = {}) {
  if (!pool)
    throw new Error(
      "MySQL is not configured. Copy server/.env from .env.example and set DB_* values.",
    );
  const [rows] = await pool.execute(sql, params);
  return rows;
}
export async function verifyDatabase() {
  if (!pool) return false;
  await pool.query("SELECT 1");
  return true;
}
export default pool;