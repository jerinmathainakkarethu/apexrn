import { query } from "../db.js";

/**
 * `publicWhere` narrows the public list (e.g. published rows only). Admins
 * read the collection through their own authenticated endpoint, so they always
 * see every row.
 */
export async function listCollection(name, orderBy, publicWhere) {
  const where = publicWhere ? ` WHERE ${publicWhere}` : "";
  return query(`SELECT * FROM ${name}${where} ORDER BY ${orderBy}`);
}

export async function findById(name, id) {
  const rows = await query(`SELECT * FROM ${name} WHERE id = :id`, { id });
  return rows[0];
}

export async function createItem(name, payload) {
  const fields = Object.keys(payload).filter((field) => /^[a-z_]+$/.test(field));
  const result = await query(
    `INSERT INTO ${name} (${fields.join(", ")}) VALUES (${fields.map((field) => `:${field}`).join(", ")})`,
    payload,
  );
  return { id: result.insertId, ...payload };
}

export async function updateItem(name, payload, id) {
  const fields = Object.keys(payload).filter((field) => /^[a-z_]+$/.test(field));
  await query(
    `UPDATE ${name} SET ${fields.map((field) => `${field} = :${field}`).join(", ")} WHERE id = :id`,
    { ...payload, id },
  );
  return findById(name, id);
}

export async function deleteItem(name, id) {
  await query(`DELETE FROM ${name} WHERE id = :id`, { id });
}