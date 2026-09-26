import { databaseConfigured } from "../db.js";
import * as programWeekModel from "../models/programWeek.js";
import fallback from "../utils/fallback.js";
import { nextId } from "../utils/helpers.js";
import { requireFields, sendValidation } from "../utils/validation.js";

export async function list(req, res, next) {
  try {
    res.json(
      databaseConfigured
        ? await programWeekModel.listPublishedWeeks()
        : fallback.weeks,
    );
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const errors = requireFields(req.body, ["week_number", "title"]);
    if (errors.length) return sendValidation(res, errors);
    if (!databaseConfigured) {
      const week = { ...req.body, id: nextId(fallback.weeks) };
      fallback.weeks.push(week);
      return res.status(201).json(week);
    }
    res.status(201).json(await programWeekModel.createWeek(req.body));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    if (!databaseConfigured) {
      const index = fallback.weeks.findIndex(
        (item) => item.id === Number(req.params.id),
      );
      if (index < 0) return res.sendStatus(404);
      fallback.weeks[index] = { ...fallback.weeks[index], ...req.body };
      return res.json(fallback.weeks[index]);
    }
    res.json(await programWeekModel.updateWeek(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    if (databaseConfigured)
      await programWeekModel.deleteWeek(req.params.id);
    else
      fallback.weeks = fallback.weeks.filter(
        (item) => item.id !== Number(req.params.id),
      );
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}