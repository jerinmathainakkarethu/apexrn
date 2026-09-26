import { Router } from "express";
import { makeCollectionController } from "../controllers/collectionController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const controller = makeCollectionController({
  name: "resources",
  orderBy: "created_at DESC",
  requiredFields: ["title", "slug", "excerpt", "content"],
});

const router = Router();
router.get("/", controller.list);
router.post("/", authenticateAdmin, controller.create);
router.put("/:id", authenticateAdmin, controller.update);
router.delete("/:id", authenticateAdmin, controller.remove);

export default router;