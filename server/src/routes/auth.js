import { Router } from "express";
import { body } from "express-validator";
import {
  requestLoginOtp,
  updateProfile,
  verifyLoginOtp,
} from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/login",
  [
    body("email").isEmail().trim().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  requestLoginOtp,
);
router.post(
  "/verify-otp",
  [
    body("email").isEmail().trim().normalizeEmail(),
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  validate,
  verifyLoginOtp,
);
router.put(
  "/profile",
  authenticateAdmin,
  [
    body("email").isEmail().trim(),
    body("currentPassword").isString().notEmpty(),
    body("newPassword")
      .optional({ checkFalsy: true })
      .isString()
      .isLength({ min: 8 }),
    body("confirmNewPassword")
      .optional({ checkFalsy: true })
      .isString(),
  ],
  validate,
  updateProfile,
);

export default router;