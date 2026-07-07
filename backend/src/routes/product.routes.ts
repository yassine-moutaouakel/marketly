import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema
} from "../validators/product.validators";

const router = Router();

router.get("/", validate(productQuerySchema, "query"), asyncHandler(productController.list));
router.get(
  "/seller/mine",
  authenticate,
  authorize("SELLER", "ADMIN"),
  asyncHandler(productController.listMine)
);
router.get("/:productId", asyncHandler(productController.getById));
router.post(
  "/",
  authenticate,
  authorize("SELLER", "ADMIN"),
  validate(createProductSchema),
  asyncHandler(productController.create)
);
router.put(
  "/:productId",
  authenticate,
  authorize("SELLER", "ADMIN"),
  validate(updateProductSchema),
  asyncHandler(productController.update)
);
router.delete(
  "/:productId",
  authenticate,
  authorize("SELLER", "ADMIN"),
  asyncHandler(productController.remove)
);

export default router;
