import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

export function requireFields(payload, fields) {
  const errors = fields
    .filter(
      (field) => typeof payload[field] !== "string" || !payload[field].trim(),
    )
    .map((field) => ({
      field,
      message: `${field.replaceAll("_", " ")} is required.`,
    }));
  return errors;
}

export function sendValidation(res, errors) {
  return res
    .status(422)
    .json({ message: "Please correct the highlighted fields.", errors });
}