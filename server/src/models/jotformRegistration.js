import { query } from "../db.js";

export async function insertJotformRegistration(payload) {
  const sql = `INSERT INTO jotform_registrations
    (jotform_submission_id, form_id, full_name, email, phone, whatsapp, course, payment_option, amount, currency, status, source, raw_payload, ip_address, user_agent)
    VALUES (:jotform_submission_id, :form_id, :full_name, :email, :phone, :whatsapp, :course, :payment_option, :amount, :currency, :status, :source, :raw_payload, :ip_address, :user_agent)`;
  await query(sql, {
    ...payload,
    raw_payload: payload.raw_payload ? JSON.stringify(payload.raw_payload) : null,
  });
}

export async function findJotformBySubmissionId(submissionId) {
  if (!submissionId) return null;
  const rows = await query(
    "SELECT id, jotform_submission_id FROM jotform_registrations WHERE jotform_submission_id = :submissionId LIMIT 1",
    { submissionId },
  );
  return rows[0] || null;
}

export async function listJotformRegistrations(limit = 100) {
  return query(
    "SELECT id, jotform_submission_id, form_id, full_name, email, phone, whatsapp, course, payment_option, amount, currency, status, source, created_at FROM jotform_registrations ORDER BY created_at DESC LIMIT :limit",
    { limit: Number(limit) },
  );
}
