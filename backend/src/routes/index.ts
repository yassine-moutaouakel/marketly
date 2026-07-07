import { Router } from "express";
import addressRoutes from "./address.routes";
import adminRoutes from "./admin.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
import categoryRoutes from "./category.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import productRoutes from "./product.routes";
import profileRoutes from "./profile.routes";
import shopRoutes from "./shop.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/addresses", addressRoutes);
router.use("/shops", shopRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
