import { Router } from "express";
import { body } from "express-validator";
import { submit } from "../controllers/contactController.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/",
  [
    body("name").trim().notEmpty().isLength({ max: 190 }),
    body("email").trim().isEmail().isLength({ max: 190 }),
    body("whatsapp").optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
    body("message").trim().notEmpty().isLength({ max: 5000 }),
  ],
  validate,
  submit,
);

export default router;