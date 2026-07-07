import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import {
  updateProductStatusSchema,
  updateShopStatusSchema
} from "../validators/admin.validators";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard", asyncHandler(adminController.dashboard));
router.get("/shops", asyncHandler(adminController.listShops));
router.patch("/shops/:shopId/status", validate(updateShopStatusSchema), asyncHandler(adminController.updateShopStatus));
router.get("/products", asyncHandler(adminController.listProducts));
router.patch(
  "/products/:productId/status",
  validate(updateProductStatusSchema),
  asyncHandler(adminController.updateProductStatus)
);

export default router;
