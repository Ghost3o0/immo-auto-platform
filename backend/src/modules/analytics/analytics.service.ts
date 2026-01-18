import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Génère les labels et dates pour les 7 derniers jours
   */
  private getLast7Days(): { labels: string[]; dates: { start: Date; end: Date }[] } {
    const labels: string[] = [];
    const dates: { start: Date; end: Date }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(start.getDate() - i);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      labels.push(start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
      dates.push({ start, end });
    }

    return { labels, dates };
  }

  /**
   * Récupère les statistiques des vues pour le dashboard
   */
  async getUserListingsStats(userId: string) {
    const [properties, vehicles] = await Promise.all([
      this.prisma.property.findMany({
        where: { userId },
        select: { id: true },
      }),
      this.prisma.vehicle.findMany({
        where: { userId },
        select: { id: true },
      }),
    ]);

    const propertyIds = properties.map((p) => p.id);
    const vehicleIds = vehicles.map((v) => v.id);

    const { labels, dates } = this.getLast7Days();
    const sevenDaysAgo = dates[0].start;

    // Récupérer toutes les vues des 7 derniers jours en une seule requête
    const [propertyViews, vehicleViews] = await Promise.all([
      propertyIds.length > 0
        ? this.prisma.propertyView.findMany({
            where: {
              propertyId: { in: propertyIds },
              viewedAt: { gte: sevenDaysAgo },
            },
            select: { viewedAt: true },
          })
        : Promise.resolve([]),
      vehicleIds.length > 0
        ? this.prisma.vehicleView.findMany({
            where: {
              vehicleId: { in: vehicleIds },
              viewedAt: { gte: sevenDaysAgo },
            },
            select: { viewedAt: true },
          })
        : Promise.resolve([]),
    ]);

    // Combiner et compter les vues par jour
    const allViews = [...propertyViews, ...vehicleViews];
    const viewsPerDay = dates.map(({ start, end }) => {
      return allViews.filter((v) => {
        const viewDate = new Date(v.viewedAt);
        return viewDate >= start && viewDate < end;
      }).length;
    });

    const totalViews = allViews.length;

    return {
      labels,
      data: viewsPerDay,
      total: totalViews,
    };
  }

  /**
   * Récupère les statistiques d'activité (messages) pour le dashboard
   */
  async getUserActivityStats(userId: string) {
    const { labels, dates } = this.getLast7Days();
    const sevenDaysAgo = dates[0].start;

    // Récupérer tous les messages des 7 derniers jours en une seule requête
    const messages = await this.prisma.message.findMany({
      where: {
        conversation: {
          OR: [{ sellerId: userId }, { buyerId: userId }],
        },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    });

    // Compter les messages par jour
    const messagesPerDay = dates.map(({ start, end }) => {
      return messages.filter((m) => {
        const msgDate = new Date(m.createdAt);
        return msgDate >= start && msgDate < end;
      }).length;
    });

    // Compter le total des messages reçus (en tant que vendeur)
    const totalReceivedMessages = await this.prisma.message.count({
      where: {
        conversation: {
          sellerId: userId,
        },
        senderId: { not: userId },
      },
    });

    return {
      labels,
      data: messagesPerDay,
      total: totalReceivedMessages,
    };
  }
}