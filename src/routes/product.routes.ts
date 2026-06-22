import { Router } from "express";
import { ProductController } from "../controllers/products.controller";
import { validateDto } from "../middleware/validation.middleware";
import { ProductListDto } from "../dtos/product-list.dto";
import { CreateProductDto, IdParamDto, UpdateProductDto } from "../dtos/product.dto";

const productRoutes = Router();
const productController = new ProductController();


productRoutes.get(
    "/",
    validateDto(ProductListDto, "query"),
    productController.list
);

productRoutes.get(
    "/:id", 
    validateDto(IdParamDto, "params"), 
    productController.findById
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