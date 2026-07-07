import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { categorySchema } from "../validators/category.validators";

const router = Router();

router.get("/", asyncHandler(categoryController.list));
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(categorySchema),
  asyncHandler(categoryController.create)
);

export default router;
