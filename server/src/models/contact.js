import { query } from "../db.js";

export async function insertContact(payload) {
  await query(
    "INSERT INTO contact_submissions (name, email, whatsapp, message) VALUES (:name, :email, :whatsapp, :message)",
    payload,
  );
}

export async function listContacts() {
  return query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
}

export async function markContactRead(id) {
  await query(
    "UPDATE contact_submissions SET status = 'read' WHERE id = :id",
    { id },
  );
}