import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehicleDto } from './dto';
import { Prisma, ListingStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée un nouveau véhicule
   */
  async create(dto: CreateVehicleDto, userId: string) {
    const { images, ...vehicleData } = dto;

    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...vehicleData,
        features: vehicleData.features || [],
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

    return vehicle;
  }

  /**
   * Récupère tous les véhicules avec filtres et pagination
   */
  async findAll(query: QueryVehicleDto) {
    const {
      brand,
      model,
      city,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      fuelType,
      transmission,
      type,
      listingType,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.VehicleWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    // Filtres
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }
    if (minYear !== undefined || maxYear !== undefined) {
      where.year = {
        ...(minYear !== undefined && { gte: minYear }),
        ...(maxYear !== undefined && { lte: maxYear }),
      };
    }
    if (maxMileage !== undefined) {
      where.mileage = { lte: maxMileage };
    }
    if (fuelType) {
      where.fuelType = fuelType;
    }
    if (transmission) {
      where.transmission = transmission;
    }
    if (type) {
      where.type = type;
    }
    if (listingType) {
      where.listingType = listingType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
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
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupère un véhicule par son ID
   */
  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
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

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

  /**
   * Met à jour un véhicule
   */
  async update(id: string, dto: UpdateVehicleDto, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres annonces');
    }

    const { images, ...updateData } = dto;

    // Si de nouvelles images sont fournies, supprimer les anciennes et créer les nouvelles
    if (images) {
      await this.prisma.image.deleteMany({
        where: { vehicleId: id },
      });
    }

    const updatedVehicle = await this.prisma.vehicle.update({
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

    return updatedVehicle;
  }

  /**
   * Supprime un véhicule
   */
  async delete(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    if (vehicle.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres annonces');
    }

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return { message: 'Véhicule supprimé avec succès' };
  }

  /**
   * Met à jour le statut d'un véhicule
   */
  async updateStatus(id: string, status: ListingStatus, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    if (vehicle.userId !== userId) {
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

    if (!validTransitions[vehicle.status]?.includes(status)) {
      throw new ForbiddenException(
        `Impossible de passer de ${vehicle.status} à ${status}`
      );
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: { status },
      include: {
        images: true,
      },
    });

    return updatedVehicle;
  }

  /**
   * Enregistre une vue pour un véhicule
   */
  async recordView(id: string) {
    try {
      await this.prisma.vehicleView.create({
        data: {
          vehicleId: id,
        },
      });
    } catch (error) {
      // Ignorer les erreurs d'enregistrement de vue
      // (ex: véhicule n'existe pas)
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