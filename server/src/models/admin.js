import { query } from "../db.js";

export async function findAdminByEmail(email) {
  const rows = await query(
    "SELECT id, email, password_hash, role FROM admins WHERE email = :email LIMIT 1",
    { email },
  );
  return rows[0];
}

export async function findAdminById(id) {
  const rows = await query(
    "SELECT id, email, password_hash, role FROM admins WHERE id = :id LIMIT 1",
    { id },
  );
  return rows[0];
}

export async function findAdminByEmailExcludingId(email, id) {
  const rows = await query(
    "SELECT id FROM admins WHERE email = :email AND id != :id LIMIT 1",
    { email, id },
  );
  return rows[0];
}

export async function updateAdminProfile(id, { email, passwordHash }) {
  if (passwordHash) {
    await query(
      "UPDATE admins SET email = :email, password_hash = :passwordHash WHERE id = :id",
      { id, email, passwordHash },
    );
  } else {
    await query("UPDATE admins SET email = :email WHERE id = :id", {
      id,
      email,
    });
  }
  return findAdminById(id);
}