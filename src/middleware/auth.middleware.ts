import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Token not provided", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token) as { userId: number };

        req.user = {
            id: payload.userId,
            email: "",
        };

        next();
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }
};