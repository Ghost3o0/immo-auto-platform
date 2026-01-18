import { Injectable, NotFoundException, ForbiddenException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import * as bcrypt from 'bcrypt';

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

    // Vérifie l'unicité de l'email si modifié
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Hash le mot de passe si fourni
    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
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
   * Change le mot de passe d'un utilisateur
   */
  async changePassword(id: string, dto: ChangePasswordDto, currentUserId: string) {
    // Vérifie que l'utilisateur modifie son propre mot de passe
    if (id !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre mot de passe');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifie l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect');
    }

    // Hash le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
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

  /**
   * Récupère les préférences de notifications d'un utilisateur
   */
  async getNotificationPreferences(id: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: id },
    });

    // Créer les préférences par défaut si elles n'existent pas
    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: { userId: id },
      });
    }

    return preferences;
  }

  /**
   * Met à jour les préférences de notifications
   */
  async updateNotificationPreferences(id: string, dto: any, currentUserId: string) {
    if (id !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres préférences');
    }

    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: id },
    });

    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userId: id,
          ...dto,
        },
      });
    } else {
      preferences = await this.prisma.notificationPreference.update({
        where: { userId: id },
        data: dto,
      });
    }

    return preferences;
  }}