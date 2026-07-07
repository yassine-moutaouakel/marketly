import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validators/auth.validators";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
