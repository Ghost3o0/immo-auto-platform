import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère un utilisateur par son ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            vehicles: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    // Vérifie que l'utilisateur modifie son propre profil
    if (id !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Supprime un utilisateur
   */
  async delete(id: string, currentUserId: string) {
    // Vérifie que l'utilisateur supprime son propre compte
    if (id !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que votre propre compte');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Compte supprimé avec succès' };
  }

  /**
   * Récupère les annonces d'un utilisateur
   */
  async getUserListings(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const [properties, vehicles] = await Promise.all([
      this.prisma.property.findMany({
        where: { userId: id },
        include: {
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.findMany({
        where: { userId: id },
        include: {
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      properties,
      vehicles,
    };
  }
}
