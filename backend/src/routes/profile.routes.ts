import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { updateProfileSchema } from "../validators/profile.validators";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(profileController.get));
router.put("/", validate(updateProfileSchema), asyncHandler(profileController.update));

export default router;
