import { Router } from "express";
import * as homeController from "../controllers/homeController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", homeController.get);
router.put("/", authenticateAdmin, homeController.update);

export default router;