import { Router } from "express";
import { makeCollectionController } from "../controllers/collectionController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const controller = makeCollectionController({
  name: "testimonials",
  orderBy: "created_at DESC",
  requiredFields: ["display_name", "story"],
  // The public pages only ever show approved stories; the admin reads every
  // row through GET /api/admin/testimonials.
  publicWhere: "status = 'published'",
});

const router = Router();
router.get("/", controller.list);
router.post("/", authenticateAdmin, controller.create);
router.put("/:id", authenticateAdmin, controller.update);
router.delete("/:id", authenticateAdmin, controller.remove);

export default router;
