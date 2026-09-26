import { Router } from "express";
import { body } from "express-validator";
import { register } from "../controllers/qaController.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/register",
  [body("name").trim().notEmpty(), body("email").isEmail()],
  validate,
  register,
);

export default router;