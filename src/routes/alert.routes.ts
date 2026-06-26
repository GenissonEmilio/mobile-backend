import { Router } from "express";

import { alertController } from "../controllers/alert.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateDto } from "../middleware/validation.middleware";
import { CreateAlertDto } from "../dtos/create-alert.dto";
import { UpdateAlertDto } from "../dtos/update-alert.dto";
import { IdParamDto } from "../dtos/product.dto";

const alertRoutes = Router();

alertRoutes.use(authMiddleware);

alertRoutes.get("/", alertController.list);

alertRoutes.post(
  "/",
  validateDto(CreateAlertDto, "body"),
  alertController.create
);

alertRoutes.put(
  "/:id",
  validateDto(IdParamDto, "params"),
  validateDto(UpdateAlertDto, "body"),
  alertController.update
);

alertRoutes.delete(
  "/:id",
  validateDto(IdParamDto, "params"),
  alertController.delete
);

export default alertRoutes;
