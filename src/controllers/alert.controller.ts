import { Request, Response, NextFunction } from "express";
import { alertService } from "../services/alert.service";

export class AlertController {

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user!.id);
            const alerts = await alertService.list(userId);

            return res.status(200).json(alerts);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user!.id);
            const alert = await alertService.create(userId, req.body);

            return res.status(201).json(alert);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user!.id);
            const alertId = Number(req.params.id);
            const alert = await alertService.update(userId, alertId, req.body);

            return res.status(200).json(alert);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.user!.id);
            const alertId = Number(req.params.id);
            await alertService.delete(userId, alertId);

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const alertController = new AlertController();