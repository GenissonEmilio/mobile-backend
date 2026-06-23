import { Router } from "express";
import { ProductController } from "../controllers/products.controller";
import { validateDto } from "../middleware/validation.middleware";
import { ProductListDto } from "../dtos/product-list.dto";
import {
    CreateProductDto,
    IdParamDto,
    PriceHistoryQueryDto,
    ProductSearchDto,
    ProductTrendingDto,
    RecordPriceSnapshotDto,
    UpdateProductDto,
} from "../dtos/product.dto";

const productRoutes = Router();
const productController = new ProductController();


productRoutes.get(
    "/",
    validateDto(ProductListDto, "query"),
    productController.list
);

productRoutes.get(
    "/search",
    validateDto(ProductSearchDto, "query"),
    productController.search
);

productRoutes.get(
    "/trending",
    validateDto(ProductTrendingDto, "query"),
    productController.trending
);

productRoutes.get(
    "/:id", 
    validateDto(IdParamDto, "params"), 
    productController.findById
);

productRoutes.get(
    "/:id/offers",
    validateDto(IdParamDto, "params"),
    productController.findOffers
);

productRoutes.get(
    "/:id/price-history",
    validateDto(IdParamDto, "params"),
    validateDto(PriceHistoryQueryDto, "query"),
    productController.findPriceHistory
);

productRoutes.post(
    "/:id/price-snapshots",
    validateDto(IdParamDto, "params"),
    validateDto(RecordPriceSnapshotDto, "body"),
    productController.recordPriceSnapshot
);

productRoutes.post(
    "/", 
    validateDto(CreateProductDto, "body"), 
    productController.create
);

productRoutes.put(
    "/:id",
    validateDto(IdParamDto, "params"),
    validateDto(UpdateProductDto, "body"),
    productController.update
);

productRoutes.delete(
    "/:id", 
    validateDto(IdParamDto, "params"), 
    productController.delete
);


export default productRoutes;
