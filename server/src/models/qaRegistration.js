import { query } from "../db.js";

export async function insertRegistration(payload) {
  await query(
    "INSERT INTO qa_registrations (name, email, whatsapp, nclex_date) VALUES (:name, :email, :whatsapp, :nclex_date)",
    { ...payload, nclex_date: payload.nclex_date || null },
  );
}

export async function listRegistrations() {
  return query("SELECT * FROM qa_registrations ORDER BY created_at DESC");
}