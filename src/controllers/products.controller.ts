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
            const  id = Number(req.params.id);
            const product = await this.productService.findById(id);

            return res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    async create(
        req: Request<{}, {}, CreateProductDto>, 
        res: Response, 
        next: NextFunction
    ) {
        try {
            const newProduct = await this.productService.create(req.body);

            return res.status(201).json(newProduct);
        } catch(error) {
            next(error);
        }
    }

    async update(
        req: Request<{ id: string }, {}, UpdateProductDto>, 
        res: Response, 
        next: NextFunction
    ) {
        try {
            const  id = Number(req.params.id);
            const updateProduct = await this.productService.update(id, req.body);

            return res.status(200).json(updateProduct);
        } catch(error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const  id = Number(req.params.id);
            await this.productService.delete(id);

            return res.status(204).send();
        } catch(error) {
            next(error);
        }
    }
    
}

export const productController = new ProductController();