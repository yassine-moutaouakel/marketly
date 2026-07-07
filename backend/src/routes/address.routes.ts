import { Router } from "express";
import { addressController } from "../controllers/address.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { addressSchema } from "../validators/address.validators";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(addressController.list));
router.post("/", validate(addressSchema), asyncHandler(addressController.create));
router.put("/:addressId", validate(addressSchema), asyncHandler(addressController.update));
router.delete("/:addressId", asyncHandler(addressController.remove));

export default router;
