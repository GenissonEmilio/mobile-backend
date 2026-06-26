import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";
import { CreateAlertDto } from "../dtos/create-alert.dto";
import { UpdateAlertDto } from "../dtos/update-alert.dto";

export class AlertService {

    async list(userId: number) {
        return prisma.alert.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        store: true,
                        category: true,
                        emoji: true,
                        currentPrice: true,
                        previousPrice: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async create(userId: number, data: CreateAlertDto) {
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const existing = await prisma.alert.findFirst({
            where: { userId, productId: data.productId },
        });

        if (existing) {
            throw new AppError("Alert already exists for this product", 409);
        }

        return prisma.alert.create({
            data: {
                userId,
                productId: data.productId,
                targetPrice: data.targetPrice,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        store: true,
                        category: true,
                        emoji: true,
                        currentPrice: true,
                        previousPrice: true,
                    },
                },
            },
        });
    }

    async update(userId: number, alertId: number, data: UpdateAlertDto) {
        const alert = await prisma.alert.findUnique({
            where: { id: alertId },
        });

        if (!alert) {
            throw new AppError("Alert not found", 404);
        }

        if (alert.userId !== userId) {
            throw new AppError("Forbidden", 403);
        }

        return prisma.alert.update({
            where: { id: alertId },
            data: { targetPrice: data.targetPrice },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        store: true,
                        category: true,
                        emoji: true,
                        currentPrice: true,
                        previousPrice: true,
                    },
                },
            },
        });
    }

    async delete(userId: number, alertId: number) {
        const alert = await prisma.alert.findUnique({
            where: { id: alertId },
        });

        if (!alert) {
            throw new AppError("Alert not found", 404);
        }

        if (alert.userId !== userId) {
            throw new AppError("Forbidden", 403);
        }

        await prisma.alert.delete({ where: { id: alertId } });
    }
}

export const alertService = new AlertService();