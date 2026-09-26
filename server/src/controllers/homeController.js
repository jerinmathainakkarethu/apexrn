import { databaseConfigured } from "../db.js";
import { getSettings, saveSettings } from "../models/settings.js";
import fallback from "../utils/fallback.js";
import { sendValidation } from "../utils/validation.js";

export async function get(req, res, next) {
  try {
    res.json(await getSettings("home", fallback.home));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    if (!req.body || Array.isArray(req.body))
      return sendValidation(res, [
        {
          field: "content",
          message: "Homepage content must be a JSON object.",
        },
      ]);
    const content = {
      ...(await getSettings("home", fallback.home)),
      ...req.body,
    };
    if (databaseConfigured) await saveSettings("home", content);
    fallback.home = content;
    res.json(content);
  } catch (error) {
    next(error);
  }
}