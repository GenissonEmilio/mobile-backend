import { Router } from "express";

import { ExternalProductsController } from "../controllers/external-products.controller";
import { validateDto } from "../middleware/validation.middleware";
import {
    ExternalProductSearchDto,
    ImportExternalProductsDto,
} from "../dtos/external-products.dto";

const externalProductRoutes = Router();
const externalProductsController = new ExternalProductsController();

externalProductRoutes.get(
    "/search",
    validateDto(ExternalProductSearchDto, "query"),
    externalProductsController.search
);

externalProductRoutes.post(
    "/import",
    validateDto(ImportExternalProductsDto, "body"),
    externalProductsController.importProducts
);

export default externalProductRoutes;
