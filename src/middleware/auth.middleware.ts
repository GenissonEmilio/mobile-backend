import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { AppError } from "../errors/AppError";
import { verifyToken } from "../utils/jwt";

interface AuthTokenPayload extends JwtPayload {
  userId: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token not provided", 401));
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return next(new AppError("Invalid authorization header", 401));
  }

  try {
    const payload = verifyToken(token) as AuthTokenPayload;

    req.user = {
      id: payload.userId,
      email: "",
    };

    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}
