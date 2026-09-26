import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/contact", authenticateAdmin, adminController.listContacts);
router.get("/qa", authenticateAdmin, adminController.listQa);
router.post("/upload", authenticateAdmin, adminController.upload);

export default router;