import { databaseConfigured } from "../db.js";
import { getSettings, saveSettings } from "../models/settings.js";
import fallback from "../utils/fallback.js";
import { sendValidation } from "../utils/validation.js";

export async function get(req, res, next) {
  try {
    res.json(await getSettings("about", fallback.about));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    if (!req.body || Array.isArray(req.body))
      return sendValidation(res, [
        { field: "content", message: "About content must be a JSON object." },
      ]);
    const content = {
      ...(await getSettings("about", fallback.about)),
      ...req.body,
    };
    if (databaseConfigured) await saveSettings("about", content);
    fallback.about = content;
    res.json(content);
  } catch (error) {
    next(error);
  }
}