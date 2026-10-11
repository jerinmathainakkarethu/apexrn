import { databaseConfigured } from "../db.js";
import { getSettings, saveSettings } from "../models/settings.js";
import fallback from "../utils/fallback.js";
import { sendValidation } from "../utils/validation.js";

const SECTION_KEY = "testimonials-page";

export async function get(req, res, next) {
  try {
    res.json(await getSettings(SECTION_KEY, fallback.testimonialsPage));
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
          message: "Testimonials page settings must be a JSON object.",
        },
      ]);
    const content = {
      ...(await getSettings(SECTION_KEY, fallback.testimonialsPage)),
      ...req.body,
    };
    if (databaseConfigured) await saveSettings(SECTION_KEY, content);
    fallback.testimonialsPage = content;
    res.json(content);
  } catch (error) {
    next(error);
  }
}
