import { databaseConfigured } from "../db.js";
import { getSettings, saveSettings } from "../models/settings.js";
import fallback from "../utils/fallback.js";
import { requireFields, sendValidation } from "../utils/validation.js";

export async function get(req, res, next) {
  try {
    res.json(await getSettings("menu", fallback.menu));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    if (!Array.isArray(req.body))
      return sendValidation(res, [
        { field: "menu", message: "Menu must be a list of items." },
      ]);
    const errors = req.body.flatMap((item, index) => [
      ...requireFields(item || {}, ["label", "url"]).map((error) => ({
        ...error,
        field: `menu[${index}].${error.field}`,
      })),
    ]);
    if (errors.length) return sendValidation(res, errors);
    const content = req.body.map((item) => ({
      label: item.label.trim(),
      url: item.url.trim(),
    }));
    if (databaseConfigured) await saveSettings("menu", content);
    fallback.menu = content;
    res.json(content);
  } catch (error) {
    next(error);
  }
}