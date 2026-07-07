import { Router } from "express";
import { shopController } from "../controllers/shop.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { shopSchema } from "../validators/shop.validators";

const router = Router();

router.use(authenticate, authorize("SELLER", "ADMIN"));
router.post("/", validate(shopSchema), asyncHandler(shopController.create));
router.get("/me", asyncHandler(shopController.me));
router.put("/me", validate(shopSchema), asyncHandler(shopController.update));

export default router;
