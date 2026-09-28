import { Router } from "express";
import * as programDetailsController from "../controllers/programDetailsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", programDetailsController.get);
router.put("/", authenticateAdmin, programDetailsController.update);

export default router;
