import { Router } from "express";
import * as aboutController from "../controllers/aboutController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", aboutController.get);
router.put("/", authenticateAdmin, aboutController.update);

export default router;