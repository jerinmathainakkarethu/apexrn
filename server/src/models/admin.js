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

export async function updateAdminPassword(id, passwordHash) {
  await query(
    "UPDATE admins SET password_hash = :passwordHash WHERE id = :id",
    { id, passwordHash },
  );
}

export async function findOtpChallenge(adminId, purpose) {
  const rows = await query(
    "SELECT admin_id, email, purpose, code_hash, expires_at_ms, created_at_ms, attempts FROM admin_otp_challenges WHERE admin_id = :adminId AND purpose = :purpose LIMIT 1",
    { adminId, purpose },
  );
  return rows[0];
}

export async function saveOtpChallenge({
  adminId,
  email,
  purpose,
  codeHash,
  expiresAt,
  createdAt,
}) {
  await query(
    `INSERT INTO admin_otp_challenges
      (admin_id, email, purpose, code_hash, expires_at_ms, created_at_ms, attempts)
     VALUES
      (:adminId, :email, :purpose, :codeHash, :expiresAt, :createdAt, 0)
     ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      code_hash = VALUES(code_hash),
      expires_at_ms = VALUES(expires_at_ms),
      created_at_ms = VALUES(created_at_ms),
      attempts = 0`,
    { adminId, email, purpose, codeHash, expiresAt, createdAt },
  );
}

export async function incrementOtpAttempts(adminId, purpose) {
  await query(
    "UPDATE admin_otp_challenges SET attempts = attempts + 1 WHERE admin_id = :adminId AND purpose = :purpose",
    { adminId, purpose },
  );
  return findOtpChallenge(adminId, purpose);
}

export async function deleteOtpChallenge(adminId, purpose) {
  await query(
    "DELETE FROM admin_otp_challenges WHERE admin_id = :adminId AND purpose = :purpose",
    { adminId, purpose },
  );
}