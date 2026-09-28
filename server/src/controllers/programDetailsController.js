import { databaseConfigured } from "../db.js";
import { getSettings, saveSettings } from "../models/settings.js";
import fallback from "../utils/fallback.js";
import { sendValidation } from "../utils/validation.js";

const SECTION_KEY = "program-details";

export async function get(req, res, next) {
  try {
    res.json(await getSettings(SECTION_KEY, fallback.programDetails));
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
          message: "Program details content must be a JSON object.",
        },
      ]);
    const content = {
      ...(await getSettings(SECTION_KEY, fallback.programDetails)),
      ...req.body,
    };
    if (databaseConfigured) await saveSettings(SECTION_KEY, content);
    fallback.programDetails = content;
    res.json(content);
  } catch (error) {
    next(error);
  }
}
