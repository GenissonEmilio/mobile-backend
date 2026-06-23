import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { ProductListDto } from "../dtos/product-list.dto";
import {
    CreateProductDto,
    PriceHistoryQueryDto,
    ProductSearchDto,
    ProductTrendingDto,
    RecordPriceSnapshotDto,
    UpdateProductDto,
} from "../dtos/product.dto";

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as ProductListDto;

            const products = await this.productService.list(query);

            return res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as ProductSearchDto;
            const products = await this.productService.search(query);

            return res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    trending = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as ProductTrendingDto;
            const products = await this.productService.trending(query);

            return res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const  id = Number(req.params.id);
            const product = await this.productService.findById(id);

            return res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    findOffers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const offers = await this.productService.findOffers(id);

            return res.status(200).json(offers);
        } catch (error) {
            next(error);
        }
    }

    findPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const query = req.query as unknown as PriceHistoryQueryDto;
            const history = await this.productService.findPriceHistory(id, query);

            return res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    recordPriceSnapshot = async (
        req: Request<{ id: string }, {}, RecordPriceSnapshotDto>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = Number(req.params.id);
            const product = await this.productService.recordPriceSnapshot(id, req.body);

            return res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    create = async (
        req: Request<{}, {}, CreateProductDto>, 
        res: Response, 
        next: NextFunction
    ) => {
        try {
            const newProduct = await this.productService.create(req.body);

            return res.status(201).json(newProduct);
        } catch(error) {
            next(error);
        }
    }

    update = async (
        req: Request<{ id: string }, {}, UpdateProductDto>, 
        res: Response, 
        next: NextFunction
    ) => {
        try {
            const  id = Number(req.params.id);
            const updateProduct = await this.productService.update(id, req.body);

            return res.status(200).json(updateProduct);
        } catch(error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
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
