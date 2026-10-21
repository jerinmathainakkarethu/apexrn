import { Router } from "express";
import { body } from "express-validator";
import { handleWebhook, manualIngest } from "../controllers/jotformController.js";
import { validate } from "../utils/validation.js";

const router = Router();

// Jotform webhook - accept POST from Jotform (or configured webhook endpoint)
router.post("/webhook", handleWebhook);

// Manual ingest for testing or API-based submissions
router.post(
  "/ingest",
  [
    body("submission_id").optional().trim(),
    body("email").optional().isEmail(),
  ],
  validate,
  manualIngest,
);

export default router;
