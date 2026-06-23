import { NextFunction, Request, Response } from "express";

import { ExternalProductService } from "../services/external-product.service";
import {
    ExternalProductSearchDto,
    ImportExternalProductsDto,
} from "../dtos/external-products.dto";

export class ExternalProductsController {
    private externalProductService: ExternalProductService;

    constructor() {
        this.externalProductService = new ExternalProductService();
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as ExternalProductSearchDto;
            const products = await this.externalProductService.search(query);

            return res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    importProducts = async (
        req: Request<{}, {}, ImportExternalProductsDto>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const result = await this.externalProductService.importProducts(req.body);

            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }
}
