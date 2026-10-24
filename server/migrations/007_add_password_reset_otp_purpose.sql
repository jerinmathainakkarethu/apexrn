ALTER TABLE admin_otp_challenges
  MODIFY COLUMN purpose ENUM('login', 'password-change', 'password-reset') NOT NULL;
