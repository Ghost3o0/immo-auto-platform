import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFavoriteDto } from './dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère tous les favoris d'un utilisateur
   */
  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: true,
          },
        },
        vehicle: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Séparer les propriétés et les véhicules
    const properties = favorites
      .filter((f) => f.property)
      .map((f) => ({
        favoriteId: f.id,
        ...f.property,
      }));

    const vehicles = favorites
      .filter((f) => f.vehicle)
      .map((f) => ({
        favoriteId: f.id,
        ...f.vehicle,
      }));

    return {
      properties,
      vehicles,
    };
  }

  /**
   * Ajoute un favori
   */
  async create(dto: CreateFavoriteDto, userId: string) {
    const { propertyId, vehicleId } = dto;

    // Vérifier qu'au moins un ID est fourni
    if (!propertyId && !vehicleId) {
      throw new BadRequestException('Vous devez fournir un propertyId ou un vehicleId');
    }

    // Vérifier que les deux ne sont pas fournis
    if (propertyId && vehicleId) {
      throw new BadRequestException('Vous ne pouvez pas fournir à la fois un propertyId et un vehicleId');
    }

    // Vérifier que la propriété ou le véhicule existe
    if (propertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        throw new NotFoundException('Propriété non trouvée');
      }
    }

    if (vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException('Véhicule non trouvé');
      }
    }

    // Vérifier si le favori existe déjà
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        ...(propertyId && { propertyId }),
        ...(vehicleId && { vehicleId }),
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Ce favori existe déjà');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        propertyId,
        vehicleId,
      },
      include: {
        property: {
          include: {
            images: true,
          },
        },
        vehicle: {
          include: {
            images: true,
          },
        },
      },
    });

    return favorite;
  }

  /**
   * Supprime un favori
   */
  async delete(id: string, userId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favori non trouvé');
    }

    await this.prisma.favorite.delete({
      where: { id },
    });

    return { message: 'Favori supprimé avec succès' };
  }

  /**
   * Vérifie si un élément est en favori
   */
  async isFavorite(userId: string, propertyId?: string, vehicleId?: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        ...(propertyId && { propertyId }),
        ...(vehicleId && { vehicleId }),
      },
    });

    return { isFavorite: !!favorite, favoriteId: favorite?.id };
  }
}
