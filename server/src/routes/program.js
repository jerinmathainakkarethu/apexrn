import { Router } from "express";
import * as programController from "../controllers/programController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();
router.get("/", programController.list);
router.post("/weeks", authenticateAdmin, programController.create);
router.put("/weeks/:id", authenticateAdmin, programController.update);
router.delete("/weeks/:id", authenticateAdmin, programController.remove);

export default router;