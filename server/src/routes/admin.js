import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import * as integrationSettingsController from "../controllers/integrationSettingsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get(
  "/testimonials",
  authenticateAdmin,
  adminController.listTestimonials,
);
router.get("/contact", authenticateAdmin, adminController.listContacts);
router.patch(
  "/contact/:id/read",
  authenticateAdmin,
  (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
      return res.status(400).json({ message: "Invalid contact submission ID." });
    }
    return next();
  },
  adminController.markContactRead,
);
router.get("/qa", authenticateAdmin, adminController.listQa);
router.get(
  "/settings/integrations",
  authenticateAdmin,
  integrationSettingsController.getSettings,
);
router.put(
  "/settings/integrations",
  authenticateAdmin,
  integrationSettingsController.updateSettings,
);
router.post(
  "/settings/integrations/test-email",
  authenticateAdmin,
  integrationSettingsController.sendTestEmail,
);
router.post("/upload", authenticateAdmin, adminController.upload);
router.post("/upload/video", authenticateAdmin, adminController.uploadVideo);

export default router;