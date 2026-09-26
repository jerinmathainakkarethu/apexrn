import { Router } from "express";
import * as menuController from "../controllers/menuController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", menuController.get);
router.put("/", authenticateAdmin, menuController.update);

export default router;