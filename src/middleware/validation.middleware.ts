import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

type RequestSource = "body" | "query" | "params";

export function validateDto<T extends object> (
    dtoClass: ClassConstructor<T>,
    source: RequestSource = "body"
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const instance = plainToInstance(dtoClass, req[source]);

        const errors: ValidationError[] = await validate(instance, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
            const errorMessages = errors
            .map((error: ValidationError) => Object.values(error.constraints || {}).join(", "))
            .join("; ");

            return next(new AppError(errorMessages, 400));
        }

        Object.defineProperty(req, source, {
            value: instance,
            configurable: true,
            enumerable: true,
            writable: true,
        });
        next();
    }
}
