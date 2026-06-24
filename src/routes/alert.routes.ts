import { Router } from "express";

import { alertController } from "../controllers/alert.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateDto } from "../middleware/validation.middleware";
import { CreateAlertDto } from "../dtos/create-alert.dto";
import { UpdateAlertDto } from "../dtos/update-alert.dto";
import { IdParamDto } from "../dtos/product.dto";

const alertRoutes = Router();

// Todas as rotas de alertas exigem autenticação
alertRoutes.use(authMiddleware);

alertRoutes.get(
    "/",
    alertController.list.bind(alertController)
);

alertRoutes.post(
    "/",
    validateDto(CreateAlertDto, "body"),
    alertController.create.bind(alertController)
);

alertRoutes.put(
    "/:id",
    validateDto(IdParamDto, "params"),
    validateDto(UpdateAlertDto, "body"),
    alertController.update.bind(alertController)
);

alertRoutes.delete(
    "/:id",
    validateDto(IdParamDto, "params"),
    alertController.delete.bind(alertController)
);

export { alertRoutes };