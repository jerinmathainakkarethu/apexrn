import { databaseConfigured } from "../db.js";
import * as collectionModel from "../models/collection.js";
import fallback from "../utils/fallback.js";
import { nextId } from "../utils/helpers.js";
import { requireFields, sendValidation } from "../utils/validation.js";

export function makeCollectionController({ name, orderBy, requiredFields }) {
  const list = async (req, res, next) => {
    try {
      res.json(
        databaseConfigured
          ? await collectionModel.listCollection(name, orderBy)
          : fallback[name],
      );
    } catch (error) {
      next(error);
    }
  };
  const create = async (req, res, next) => {
    try {
      const errors = requireFields(req.body, requiredFields);
      if (errors.length) return sendValidation(res, errors);
      if (!databaseConfigured) {
        const item = { ...req.body, id: nextId(fallback[name]) };
        fallback[name].push(item);
        return res.status(201).json(item);
      }
      res.status(201).json(await collectionModel.createItem(name, req.body));
    } catch (error) {
      next(error);
    }
  };
  const update = async (req, res, next) => {
    try {
      const errors = requireFields(req.body, requiredFields);
      if (errors.length) return sendValidation(res, errors);
      if (!databaseConfigured) {
        const index = fallback[name].findIndex(
          (item) => item.id === Number(req.params.id),
        );
        if (index < 0) return res.sendStatus(404);
        fallback[name][index] = { ...fallback[name][index], ...req.body };
        return res.json(fallback[name][index]);
      }
      res.json(
        await collectionModel.updateItem(name, req.body, req.params.id),
      );
    } catch (error) {
      next(error);
    }
  };
  const remove = async (req, res, next) => {
    try {
      if (databaseConfigured)
        await collectionModel.deleteItem(name, req.params.id);
      else
        fallback[name] = fallback[name].filter(
          (item) => item.id !== Number(req.params.id),
        );
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
  return { list, create, update, remove };
}