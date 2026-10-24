import { Router } from "express";
import { body } from "express-validator";
import {
  requestLoginOtp,
  requestPasswordChangeOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  updateProfile,
  verifyLoginOtp,
  verifyPasswordChangeOtp,
} from "../controllers/authController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";

const router = Router();
router.post(
  "/password-reset/request-otp",
  [body("email").isEmail().trim().normalizeEmail()],
  validate,
  requestPasswordResetOtp,
);
router.post(
  "/password-reset/verify-otp",
  [
    body("email").isEmail().trim().normalizeEmail(),
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
    body("newPassword").isString().isLength({ min: 8 }),
    body("confirmNewPassword").isString().notEmpty(),
  ],
  validate,
  resetPasswordWithOtp,
);
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
  ],
  validate,
  updateProfile,
);
router.post(
  "/profile/password/request-otp",
  authenticateAdmin,
  requestPasswordChangeOtp,
);
router.post(
  "/profile/password/verify-otp",
  authenticateAdmin,
  [
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
    body("newPassword").isString().isLength({ min: 8 }),
    body("confirmNewPassword").isString().notEmpty(),
  ],
  validate,
  verifyPasswordChangeOtp,
);

export default router;