import { Router } from "express";

import { authRoutes } from "./auth.routes";
import productRoutes from "./product.routes";
import externalProductRoutes from "./external-products.routes";
import { alertRoutes } from "./alert.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/external-products", externalProductRoutes);
router.use("/alerts", alertRoutes);

export { router };
