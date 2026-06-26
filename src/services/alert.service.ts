import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";
import { CreateAlertDto } from "../dtos/create-alert.dto";
import { UpdateAlertDto } from "../dtos/update-alert.dto";

export class AlertService {
  private calcularVariation(current: number, previous: number | null): number {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }

  private toAlertProduct(
    alert: Prisma.AlertGetPayload<{ include: { product: true } }>
  ) {
    return {
      id: alert.id,
      userId: alert.userId,
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      product: {
        ...alert.product,
        variationPercentage: this.calcularVariation(
          alert.product.currentPrice,
          alert.product.previousPrice
        ),
      },
    };
  }

  async list(userId: number) {
    const alerts = await prisma.alert.findMany({
      where: { userId, isActive: true },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return alerts.map((alert) => this.toAlertProduct(alert));
  }

  async create(userId: number, data: CreateAlertDto) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existing = await prisma.alert.findFirst({
      where: {
        userId,
        productId: data.productId,
        isActive: true,
      },
    });

    if (existing) {
      throw new AppError("Alert already exists for this product", 409);
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        productId: data.productId,
        targetPrice: data.targetPrice,
      },
      include: { product: true },
    });

    return this.toAlertProduct(alert);
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

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data,
      include: { product: true },
    });

    return this.toAlertProduct(updatedAlert);
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
