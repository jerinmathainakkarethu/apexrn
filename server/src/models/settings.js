import { databaseConfigured, query } from "../db.js";

export async function getSettings(sectionKey, fallbackValue) {
  if (!databaseConfigured) return fallbackValue;
  const rows = await query(
    "SELECT content FROM homepage_sections WHERE section_key = :sectionKey LIMIT 1",
    { sectionKey },
  );
  return rows[0]?.content ? JSON.parse(rows[0].content) : fallbackValue;
}

export async function saveSettings(sectionKey, content) {
  await query(
    "INSERT INTO homepage_sections (section_key, content) VALUES (:sectionKey, :content) ON DUPLICATE KEY UPDATE content = VALUES(content)",
    { sectionKey, content: JSON.stringify(content) },
  );
}

export async function getCollection(name) {
  const orderBy = name === "faqs" ? "sort_order ASC, id DESC" : "created_at DESC";
  return query(`SELECT * FROM ${name} ORDER BY ${orderBy}`);
}