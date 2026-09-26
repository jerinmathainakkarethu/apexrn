import { databaseConfigured } from "../db.js";
import { insertRegistration } from "../models/qaRegistration.js";
import fallback from "../utils/fallback.js";
import { nextId } from "../utils/helpers.js";

export async function register(req, res, next) {
  try {
    if (databaseConfigured) await insertRegistration(req.body);
    else
      fallback.registrations.push({
        ...req.body,
        id: nextId(fallback.registrations),
        created_at: new Date().toISOString(),
        status: "new",
      });
    res.status(201).json({ message: "You are registered for the Wednesday Q&A." });
  } catch (error) {
    next(error);
  }
}