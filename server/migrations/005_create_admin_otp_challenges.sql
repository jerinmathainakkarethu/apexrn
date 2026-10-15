CREATE TABLE IF NOT EXISTS admin_otp_challenges (
  admin_id INT NOT NULL,
  email VARCHAR(190) NOT NULL,
  purpose ENUM('login', 'password-change') NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at_ms BIGINT NOT NULL,
  created_at_ms BIGINT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (admin_id, purpose),
  CONSTRAINT fk_admin_otp_challenges_admin
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
