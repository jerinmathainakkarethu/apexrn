import { databaseConfigured } from "../db.js";
import { insertContact } from "../models/contact.js";
import fallback from "../utils/fallback.js";
import { nextId } from "../utils/helpers.js";

export async function submit(req, res, next) {
  try {
    if (databaseConfigured) await insertContact(req.body);
    else
      fallback.contacts.push({
        ...req.body,
        id: nextId(fallback.contacts),
        created_at: new Date().toISOString(),
        status: "new",
      });
    res
      .status(201)
      .json({ message: "Thanks, your message has been received." });
  } catch (error) {
    next(error);
  }
}