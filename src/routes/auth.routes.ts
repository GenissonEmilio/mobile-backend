import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { validateDto } from "../middleware/validation.middleware";
import { CreateUserDto } from "../dtos/create-user.dto";

const router = Router();

router.post(
  "/register",
  validateDto(CreateUserDto, "body"),
  authController.register.bind(authController)
);

router.post(
  "/login",
  authController.login.bind(authController)
);

export { router as authRoutes };