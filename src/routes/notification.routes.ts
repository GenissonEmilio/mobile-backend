import { Router } from "express";

import { notificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);

notificationRoutes.get("/", notificationController.list);

export default notificationRoutes;
