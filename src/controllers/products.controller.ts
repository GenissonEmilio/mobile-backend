import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { ProductListDto } from "../dtos/product-list.dto";
import { CreateProductDto, IdParamDto, UpdateProductDto } from "../dtos/product.dto";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as unknown as ProductListDto;

            const products = await this.productService.list(query);

            return res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as unknown as IdParamDto;
            const product = await this.productService.findById(Number(id));

            return res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as CreateProductDto;
            const newProduct = await this.productService.create(body);

            return res.status(201).json(newProduct);
        } catch(error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as unknown as IdParamDto;
            const body = req.body as UpdateProductDto;
            const updateProduct = await this.productService.update(Number(id), body);

            return res.status(200).json(updateProduct);
        } catch(error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as unknown as IdParamDto;
            await this.productService.delete(Number(id));

            return res.status(204).send();
        } catch(error) {
            next(error);
        }
    }
    
}

export const productController = new ProductController();