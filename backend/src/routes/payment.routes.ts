import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createCheckoutSessionSchema } from "../validators/payment.validators";

const router = Router();

router.post(
  "/checkout-session",
  authenticate,
  validate(createCheckoutSessionSchema),
  asyncHandler(paymentController.createCheckoutSession)
);

export default router;
