import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { checkoutSchema, updateOrderStatusSchema } from "../validators/order.validators";

const router = Router();

router.use(authenticate);
router.get("/my", asyncHandler(orderController.listMine));
router.get("/received", authorize("SELLER", "ADMIN"), asyncHandler(orderController.listReceived));
router.post("/checkout", validate(checkoutSchema), asyncHandler(orderController.checkout));
router.patch(
  "/:orderId/status",
  authorize("SELLER", "ADMIN"),
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus)
);

export default router;
