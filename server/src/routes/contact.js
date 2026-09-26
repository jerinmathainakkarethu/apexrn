import { Router } from "express";
import { body } from "express-validator";
import { submit } from "../controllers/contactController.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().notEmpty(),
  ],
  validate,
  submit,
);

export default router;