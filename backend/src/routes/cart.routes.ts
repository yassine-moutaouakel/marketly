import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.validators";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(cartController.get));
router.post("/items", validate(addCartItemSchema), asyncHandler(cartController.addItem));
router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem)
);
router.delete("/items/:productId", asyncHandler(cartController.removeItem));

export default router;
