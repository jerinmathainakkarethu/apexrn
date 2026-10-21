import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { databaseConfigured, query } from "../db.js";

const SECRET_PREFIX = "encrypted:v1:";
const ENCRYPTION_KEY = createHash("sha256")
  .update(process.env.JWT_SECRET || "development-secret")
  .digest();

const SMTP_DEFAULTS = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : Number(process.env.SMTP_PORT || 465) === 465,
  user: process.env.SMTP_USER || "",
  password: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
};

function parseSetting(value) {
  if (!value) return {};
  return typeof value === "string" ? JSON.parse(value) : value;
}

function encryptPassword(password) {
  if (!password) return password;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);
  return `${SECRET_PREFIX}${iv.toString("hex")}:${cipher
    .getAuthTag()
    .toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptPassword(password) {
  if (!password?.startsWith(SECRET_PREFIX)) return password;
  const [ivHex, tagHex, encryptedHex] = password
    .slice(SECRET_PREFIX.length)
    .split(":");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getIntegrationSettings() {
  if (!databaseConfigured) {
    return { smtp: { ...SMTP_DEFAULTS } };
  }
  const rows = await query(
    "SELECT setting_value FROM site_settings WHERE setting_key = 'integrations' LIMIT 1",
  );
  const stored = parseSetting(rows[0]?.setting_value);
  const smtp = { ...SMTP_DEFAULTS, ...(stored.smtp || {}) };
  smtp.password = decryptPassword(smtp.password);
  return {
    smtp,
  };
}

export async function saveIntegrationSettings(settings) {
  if (!databaseConfigured) {
    throw new Error("Integration settings require a configured MySQL database.");
  }
  await query(
    `INSERT INTO site_settings (setting_key, setting_value)
     VALUES ('integrations', :settingValue)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    {
      settingValue: JSON.stringify({
        ...settings,
        smtp: {
          ...settings.smtp,
          password: encryptPassword(settings.smtp.password),
        },
      }),
    },
  );
}

export async function getSmtpSettings() {
  return (await getIntegrationSettings()).smtp;
}
