import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateConversationDto, SendMessageDto } from './dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle conversation ou retourne une existante
   */
  async createConversation(dto: CreateConversationDto, buyerId: string) {
    // Vérifie qu'on ne peut pas se contacter soi-même
    if (dto.sellerId === buyerId) {
      throw new BadRequestException('Vous ne pouvez pas vous envoyer un message à vous-même');
    }

    // Vérifie que le vendeur existe
    const seller = await this.prisma.user.findUnique({
      where: { id: dto.sellerId },
    });
    if (!seller) {
      throw new NotFoundException('Vendeur non trouvé');
    }

    // Vérifie qu'au moins une annonce est spécifiée
    if (!dto.propertyId && !dto.vehicleId) {
      throw new BadRequestException('Vous devez spécifier une annonce');
    }

    // Cherche une conversation existante
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId: dto.sellerId,
        ...(dto.propertyId && { propertyId: dto.propertyId }),
        ...(dto.vehicleId && { vehicleId: dto.vehicleId }),
      },
    });

    // Si pas de conversation existante, en crée une nouvelle
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          buyerId,
          sellerId: dto.sellerId,
          propertyId: dto.propertyId,
          vehicleId: dto.vehicleId,
        },
      });
    }

    // Envoie le premier message
    await this.prisma.message.create({
      data: {
        content: dto.message,
        senderId: buyerId,
        conversationId: conversation.id,
      },
    });

    return this.getConversation(conversation.id, buyerId);
  }

  /**
   * Récupère toutes les conversations d'un utilisateur
   */
  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        property: {
          select: { id: true, title: true, images: { take: 1 } },
        },
        vehicle: {
          select: { id: true, title: true, images: { take: 1 } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      buyer: conv.buyer,
      seller: conv.seller,
      property: conv.property,
      vehicle: conv.vehicle,
      lastMessage: conv.messages[0] || null,
      unreadCount: conv._count.messages,
      updatedAt: conv.updatedAt,
    }));
  }

  /**
   * Récupère une conversation avec ses messages
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        buyer: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        property: {
          select: { id: true, title: true, price: true, images: { take: 1 } },
        },
        vehicle: {
          select: { id: true, title: true, price: true, images: { take: 1 } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifie que l'utilisateur participe à la conversation
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette conversation');
    }

    // Marque les messages non lus comme lus
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return conversation;
  }

  /**
   * Envoie un message dans une conversation
   */
  async sendMessage(conversationId: string, dto: SendMessageDto, senderId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifie que l'utilisateur participe à la conversation
    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      throw new ForbiddenException('Accès non autorisé à cette conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        senderId,
        conversationId,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Met à jour le updatedAt de la conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Compte les messages non lus
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        read: false,
        senderId: { not: userId },
        conversation: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
    });

    return { count };
  }

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return { message: 'Messages marqués comme lus' };
  }
}
