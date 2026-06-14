import { Request, Response, NextFunction } from "express";

import { authService } from "../services/auth.service";

export class AuthController {
    async register(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await authService.register(req.body);

            return res.status(201).json(result);
            } catch (error) {
            next(error);
        }
    }

    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await authService.login(req.body);

            return res.status(200).json(result);
            } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();