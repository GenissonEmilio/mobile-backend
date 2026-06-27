import { NextFunction, Request, Response } from "express";

import { notificationService } from "../services/notification.service";

export class NotificationController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.user?.id);
      const notifications = await notificationService.list(userId);

      return res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
