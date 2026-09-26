import { query } from "../db.js";

export async function findAdminByEmail(email) {
  const rows = await query(
    "SELECT id, email, password_hash, role FROM admins WHERE email = :email LIMIT 1",
    { email },
  );
  return rows[0];
}