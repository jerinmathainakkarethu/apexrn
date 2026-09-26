import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const migrationsDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "apexrn",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
});

await connection.query(
  "CREATE TABLE IF NOT EXISTS migrations (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
);

const files = fs
  .readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();

let applied = 0;
let skipped = 0;
for (const file of files) {
  const [rows] = await connection.query(
    "SELECT 1 FROM migrations WHERE name = ?",
    [file],
  );
  if (rows.length > 0) {
    skipped += 1;
    continue;
  }
  const sql = fs.readFileSync(path.join(migrationsDirectory, file), "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await connection.query(statement);
  }
  await connection.query("INSERT INTO migrations (name) VALUES (?)", [file]);
  applied += 1;
  console.log(`Applied ${file}`);
}

await connection.end();
console.log(
  `Migrations complete: ${applied} applied, ${skipped} already applied`,
);