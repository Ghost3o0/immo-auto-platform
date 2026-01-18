import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto';
import { Prisma, ListingStatus } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle propriété
   */
  async create(dto: CreatePropertyDto, userId: string) {
    const { images, ...propertyData } = dto;

    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        country: propertyData.country || 'France',
        features: propertyData.features || [],
        userId,
        images: images
          ? {
              create: images.map((data) => ({
                data,
                mimeType: this.getMimeType(data),
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return property;
  }

  /**
   * Récupère toutes les propriétés avec filtres et pagination
   */
  async findAll(query: QueryPropertyDto) {
    const {
      city,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      minRooms,
      maxRooms,
      type,
      listingType,
      features,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.PropertyWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    // Filtres
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }
    if (minSurface !== undefined || maxSurface !== undefined) {
      where.surface = {
        ...(minSurface !== undefined && { gte: minSurface }),
        ...(maxSurface !== undefined && { lte: maxSurface }),
      };
    }
    if (minRooms !== undefined || maxRooms !== undefined) {
      where.rooms = {
        ...(minRooms !== undefined && { gte: minRooms }),
        ...(maxRooms !== undefined && { lte: maxRooms }),
      };
    }
    if (type) {
      where.type = type;
    }
    if (listingType) {
      where.listingType = listingType;
    }
    if (features && features.length > 0) {
      where.features = { hasEvery: features };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          images: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupère une propriété par son ID
   */
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Propriété non trouvée');
    }

    return property;
  }

  /**
   * Met à jour une propriété
   */
  async update(id: string, dto: UpdatePropertyDto, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Propriété non trouvée');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres annonces');
    }

    const { images, ...updateData } = dto;

    // Si de nouvelles images sont fournies, supprimer les anciennes et créer les nouvelles
    if (images) {
      await this.prisma.image.deleteMany({
        where: { propertyId: id },
      });
    }

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        images: images
          ? {
              create: images.map((data) => ({
                data,
                mimeType: this.getMimeType(data),
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return updatedProperty;
  }

  /**
   * Supprime une propriété
   */
  async delete(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Propriété non trouvée');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres annonces');
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Propriété supprimée avec succès' };
  }

  /**
   * Met à jour le statut d'une propriété
   */
  async updateStatus(id: string, status: ListingStatus, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Propriété non trouvée');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres annonces');
    }

    // Valide les transitions d'état
    const validTransitions: Record<ListingStatus, ListingStatus[]> = {
      [ListingStatus.DRAFT]: [ListingStatus.ACTIVE, ListingStatus.INACTIVE],
      [ListingStatus.ACTIVE]: [ListingStatus.DRAFT, ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.INACTIVE],
      [ListingStatus.SOLD]: [ListingStatus.INACTIVE],
      [ListingStatus.RENTED]: [ListingStatus.INACTIVE],
      [ListingStatus.INACTIVE]: [ListingStatus.ACTIVE, ListingStatus.DRAFT],
    };

    if (!validTransitions[property.status]?.includes(status)) {
      throw new ForbiddenException(
        `Impossible de passer de ${property.status} à ${status}`
      );
    }

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: { status },
      include: {
        images: true,
      },
    });

    return updatedProperty;
  }

  /**
   * Enregistre une vue pour une propriété
   */
  async recordView(id: string) {
    try {
      await this.prisma.propertyView.create({
        data: {
          propertyId: id,
        },
      });
    } catch (error) {
      // Ignorer les erreurs d'enregistrement de vue
      // (ex: propriété n'existe pas)
    }
  }

  /**   * Détermine le type MIME d'une image base64
   */
  private getMimeType(base64: string): string {
    if (base64.startsWith('data:image/jpeg')) return 'image/jpeg';
    if (base64.startsWith('data:image/png')) return 'image/png';
    if (base64.startsWith('data:image/gif')) return 'image/gif';
    if (base64.startsWith('data:image/webp')) return 'image/webp';
    return 'image/jpeg';
  }
}