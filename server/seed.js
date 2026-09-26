import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { homeContent, aboutContent, menuContent } from "./content-seed.js";

const email = process.env.SEED_ADMIN_EMAIL || "admin@apexrnprep.com";
const password = process.env.SEED_ADMIN_PASSWORD;

if (!password) {
  console.error(
    "Set SEED_ADMIN_PASSWORD in server/.env before running the seed command.",
  );
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "apexrn",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
});

const passwordHash = await bcrypt.hash(password, 12);
await connection.execute(
  "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)",
  [email, passwordHash, "admin"],
);

const weeks = [
  ["01", "Fundamentals & safety"],
  ["02-05", "Medical-surgical core systems"],
  ["06", "Pharmacology"],
  ["07", "Maternity"],
  ["08", "Pediatrics"],
  ["09", "Mental health"],
  ["10-11", "NGN, clinical judgment & mock practice"],
];
const [weekCount] = await connection.execute(
  "SELECT COUNT(*) AS count FROM program_weeks",
);
if (weekCount[0].count === 0) {
  for (const [index, [weekNumber, title]] of weeks.entries()) {
    await connection.execute(
      "INSERT INTO program_weeks (week_number, title, description, topics, learning_outcomes, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        weekNumber,
        title,
        "",
        JSON.stringify([]),
        JSON.stringify([]),
        index,
        "published",
      ],
    );
  }
}

await connection.execute(
  "INSERT INTO homepage_sections (section_key, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
  ["home", JSON.stringify(homeContent)],
);
await connection.execute(
  "INSERT INTO homepage_sections (section_key, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
  ["about", JSON.stringify(aboutContent)],
);
await connection.execute(
  "INSERT INTO homepage_sections (section_key, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
  ["menu", JSON.stringify(menuContent)],
);

const [testimonialCount] = await connection.execute(
  "SELECT COUNT(*) AS count FROM testimonials",
);
if (testimonialCount[0].count === 0) {
  for (let index = 1; index <= 5; index += 1) {
    await connection.execute(
      "INSERT INTO testimonials (display_name, country, story, result, video_url, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        `Student story placeholder ${String(index).padStart(2, "0")}`,
        "Replace from Admin",
        "Approved student story will appear here once supplied by the APEX RN Prep team.",
        "Placeholder",
        "https://www.youtube.com/watch?v=ScMzIvxBSi4",
        false,
        "published",
      ],
    );
  }
}
await connection.end();
console.log(
  `Admin account seeded in ${process.env.DB_NAME || "apexrn"}: ${email}`,
);
