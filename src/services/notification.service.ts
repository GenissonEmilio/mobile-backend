import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client";

type AlertWithProduct = Prisma.AlertGetPayload<{ include: { product: true } }>;

export class NotificationService {
  private formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2)}`;
  }

  private getDateGroup(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "HOJE";
    if (date.toDateString() === yesterday.toDateString()) return "ONTEM";
    return date.toLocaleDateString("pt-BR");
  }

  private getTimeAgo(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "Agora ha pouco";
    if (diffMinutes < 60) return `${diffMinutes} min atras`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atras`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ontem";
    return `${diffDays} dias atras`;
  }

  private toNotification(alert: AlertWithProduct) {
    const reachedTarget = alert.product.currentPrice <= alert.targetPrice;
    const missingAmount = Math.max(
      alert.product.currentPrice - alert.targetPrice,
      0
    );

    return {
      id: `alert-${alert.id}`,
      title: reachedTarget
        ? `${alert.product.name} atingiu seu alvo!`
        : `${alert.product.name} esta sendo monitorado`,
      description: reachedTarget
        ? `O preco atual e ${this.formatCurrency(
            alert.product.currentPrice
          )} em ${alert.product.store}. Sua meta era ${this.formatCurrency(
            alert.targetPrice
          )}.`
        : `Preco atual: ${this.formatCurrency(
            alert.product.currentPrice
          )}. Faltam ${this.formatCurrency(
            missingAmount
          )} para atingir seu alvo.`,
      timeAgo: this.getTimeAgo(alert.createdAt),
      type: reachedTarget ? "priceDrop" : "alert",
      isRead: false,
      dateGroup: this.getDateGroup(alert.createdAt),
      createdAt: alert.createdAt,
    };
  }

  async list(userId: number) {
    const alerts = await prisma.alert.findMany({
      where: { userId, isActive: true },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    const alertNotifications = alerts.map((alert) =>
      this.toNotification(alert)
    );

    const systemNotifications = alerts.slice(0, 5).map((alert) => ({
      id: `created-${alert.id}`,
      title: "Alerta criado com sucesso",
      description: `Monitoramento de ${alert.product.name} foi ativado.`,
      timeAgo: this.getTimeAgo(alert.createdAt),
      type: "system",
      isRead: true,
      dateGroup: this.getDateGroup(alert.createdAt),
      createdAt: alert.createdAt,
    }));

    return [...alertNotifications, ...systemNotifications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const notificationService = new NotificationService();
