import { Router } from "express";
import { makeCollectionController } from "../controllers/collectionController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const controller = makeCollectionController({
  name: "faqs",
  orderBy: "sort_order ASC, id DESC",
  requiredFields: ["question", "answer"],
});

const router = Router();
router.get("/", controller.list);
router.post("/", authenticateAdmin, controller.create);
router.put("/:id", authenticateAdmin, controller.update);
router.delete("/:id", authenticateAdmin, controller.remove);

export default router;