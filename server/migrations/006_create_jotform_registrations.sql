-- Jotform registrations captured via webhook/API
CREATE TABLE IF NOT EXISTS jotform_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jotform_submission_id VARCHAR(128) NULL,
  form_id VARCHAR(64) NULL,
  full_name VARCHAR(190) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  whatsapp VARCHAR(50) NULL,
  course VARCHAR(190) NULL,
  payment_option VARCHAR(100) NULL,
  amount DECIMAL(10,2) NULL,
  currency VARCHAR(10) NULL,
  status ENUM('received','processed','duplicate','error') DEFAULT 'received',
  source ENUM('webhook','api') DEFAULT 'webhook',
  raw_payload JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_jotform_submission (jotform_submission_id),
  KEY idx_jotform_email (email),
  KEY idx_jotform_created (created_at)
);