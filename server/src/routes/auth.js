import { Router } from "express";
import { body } from "express-validator";
import { login } from "../controllers/authController.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  validate,
  login,
);

export default router;