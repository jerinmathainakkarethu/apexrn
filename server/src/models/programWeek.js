import { query } from "../db.js";

export async function listPublishedWeeks() {
  return query(
    'SELECT * FROM program_weeks WHERE status = "published" ORDER BY sort_order, week_number',
  );
}

export async function findWeekById(id) {
  const rows = await query("SELECT * FROM program_weeks WHERE id = :id", { id });
  return rows[0];
}

export async function createWeek(payload) {
  const result = await query(
    "INSERT INTO program_weeks (week_number, title, description, topics, learning_outcomes, sort_order, status) VALUES (:week_number, :title, :description, :topics, :learning_outcomes, :sort_order, :status)",
    {
      ...payload,
      topics: JSON.stringify(payload.topics || []),
      learning_outcomes: JSON.stringify(payload.learning_outcomes || []),
      sort_order: payload.sort_order || 0,
      status: payload.status || "published",
    },
  );
  return { id: result.insertId, ...payload };
}

export async function updateWeek(id, payload) {
  await query(
    "UPDATE program_weeks SET week_number = COALESCE(:week_number, week_number), title = COALESCE(:title, title), description = COALESCE(:description, description), status = COALESCE(:status, status), sort_order = COALESCE(:sort_order, sort_order) WHERE id = :id",
    { ...payload, id },
  );
  return findWeekById(id);
}

export async function deleteWeek(id) {
  await query("DELETE FROM program_weeks WHERE id = :id", { id });
}