import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get(
  "/testimonials",
  authenticateAdmin,
  adminController.listTestimonials,
);
router.get("/contact", authenticateAdmin, adminController.listContacts);
router.get("/qa", authenticateAdmin, adminController.listQa);
router.post("/upload", authenticateAdmin, adminController.upload);
router.post("/upload/video", authenticateAdmin, adminController.uploadVideo);

export default router;