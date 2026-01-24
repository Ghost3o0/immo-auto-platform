import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  UserRole,
  UserStatus,
  ListingStatus,
  ReportStatus,
  Prisma,
} from '@prisma/client';
import {
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateListingStatusDto,
  ModerationActionDto,
  ResolveReportDto,
  AdminListingsQueryDto,
  AdminUsersQueryDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Stats
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalProperties,
      totalVehicles,
      pendingProperties,
      pendingVehicles,
      pendingReports,
      recentRegistrations,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.property.count(),
      this.prisma.vehicle.count(),
      this.prisma.property.count({ where: { status: ListingStatus.DRAFT } }),
      this.prisma.vehicle.count({ where: { status: ListingStatus.DRAFT } }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      listings: {
        properties: totalProperties,
        vehicles: totalVehicles,
        pendingModeration: pendingProperties + pendingVehicles,
      },
      reports: { pending: pendingReports },
      recentActivity: { newUsersThisWeek: recentRegistrations },
    };
  }

  // User Management
  async getUsers(query: AdminUsersQueryDto) {
    const { role, status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              properties: true,
              vehicles: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        updatedAt: true,
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        vehicles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            properties: true,
            vehicles: true,
            favorites: true,
            messages: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    // Log action
    await this.logAdminAction(adminId, 'user_role_changed', 'user', userId, {
      oldRole: user.role,
      newRole: dto.role,
    });

    return updated;
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const data: Prisma.UserUpdateInput = {
      status: dto.status,
    };

    if (dto.status === UserStatus.SUSPENDED || dto.status === UserStatus.BANNED) {
      data.suspendedAt = new Date();
      data.suspendedReason = dto.reason;
    } else {
      data.suspendedAt = null;
      data.suspendedReason = null;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    // Log action
    await this.logAdminAction(adminId, `user_${dto.status.toLowerCase()}`, 'user', userId, {
      reason: dto.reason,
    });

    return updated;
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Impossible de supprimer un administrateur');
    }

    await this.prisma.user.delete({ where: { id: userId } });

    // Log action
    await this.logAdminAction(adminId, 'user_deleted', 'user', userId, {
      email: user.email,
      name: user.name,
    });

    return { success: true };
  }

  // Listing Management
  async getListings(query: AdminListingsQueryDto) {
    const { type, status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const results: any[] = [];
    let totalCount = 0;

    // Build where clauses
    const propertyWhere: Prisma.PropertyWhereInput = {};
    const vehicleWhere: Prisma.VehicleWhereInput = {};

    if (status) {
      propertyWhere.status = status;
      vehicleWhere.status = status;
    }
    if (search) {
      propertyWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
      vehicleWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (!type || type === 'property') {
      const [properties, count] = await Promise.all([
        this.prisma.property.findMany({
          where: propertyWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            images: { take: 1 },
            _count: { select: { reports: true } },
          },
        }),
        this.prisma.property.count({ where: propertyWhere }),
      ]);

      results.push(
        ...properties.map((p) => ({
          ...p,
          type: 'property',
          reportsCount: p._count.reports,
        }))
      );
      if (type === 'property') totalCount = count;
    }

    if (!type || type === 'vehicle') {
      const [vehicles, count] = await Promise.all([
        this.prisma.vehicle.findMany({
          where: vehicleWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            images: { take: 1 },
            _count: { select: { reports: true } },
          },
        }),
        this.prisma.vehicle.count({ where: vehicleWhere }),
      ]);

      results.push(
        ...vehicles.map((v) => ({
          ...v,
          type: 'vehicle',
          reportsCount: v._count.reports,
        }))
      );
      if (type === 'vehicle') totalCount = count;
    }

    // Sort by createdAt
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate total if fetching both types
    if (!type) {
      totalCount = results.length;
    }

    // Apply pagination after sorting
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      page,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getListing(type: 'property' | 'vehicle', id: string) {
    if (type === 'property') {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: true,
          reports: {
            include: {
              reporter: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      if (!property) throw new NotFoundException('Annonce non trouvée');
      return { ...property, type: 'property' };
    } else {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: true,
          reports: {
            include: {
              reporter: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      if (!vehicle) throw new NotFoundException('Annonce non trouvée');
      return { ...vehicle, type: 'vehicle' };
    }
  }

  async updateListingStatus(
    type: 'property' | 'vehicle',
    id: string,
    dto: UpdateListingStatusDto,
    adminId: string
  ) {
    if (type === 'property') {
      const property = await this.prisma.property.update({
        where: { id },
        data: { status: dto.status },
      });

      await this.logAdminAction(adminId, 'listing_status_changed', 'property', id, {
        newStatus: dto.status,
        reason: dto.reason,
      });

      return property;
    } else {
      const vehicle = await this.prisma.vehicle.update({
        where: { id },
        data: { status: dto.status },
      });

      await this.logAdminAction(adminId, 'listing_status_changed', 'vehicle', id, {
        newStatus: dto.status,
        reason: dto.reason,
      });

      return vehicle;
    }
  }

  async deleteListing(type: 'property' | 'vehicle', id: string, adminId: string) {
    if (type === 'property') {
      const property = await this.prisma.property.findUnique({ where: { id } });
      if (!property) throw new NotFoundException('Annonce non trouvée');

      await this.prisma.property.delete({ where: { id } });

      await this.logAdminAction(adminId, 'listing_deleted', 'property', id, {
        title: property.title,
      });
    } else {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
      if (!vehicle) throw new NotFoundException('Annonce non trouvée');

      await this.prisma.vehicle.delete({ where: { id } });

      await this.logAdminAction(adminId, 'listing_deleted', 'vehicle', id, {
        title: vehicle.title,
      });
    }

    return { success: true };
  }

  // Moderation
  async getPendingListings() {
    const [properties, vehicles] = await Promise.all([
      this.prisma.property.findMany({
        where: { status: ListingStatus.DRAFT },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: { take: 1 },
        },
      }),
      this.prisma.vehicle.findMany({
        where: { status: ListingStatus.DRAFT },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          images: { take: 1 },
        },
      }),
    ]);

    return {
      properties: properties.map((p) => ({ ...p, type: 'property' })),
      vehicles: vehicles.map((v) => ({ ...v, type: 'vehicle' })),
      total: properties.length + vehicles.length,
    };
  }

  async moderateListing(
    type: 'property' | 'vehicle',
    id: string,
    dto: ModerationActionDto,
    adminId: string
  ) {
    const newStatus =
      dto.action === 'approve' ? ListingStatus.ACTIVE : ListingStatus.INACTIVE;

    if (type === 'property') {
      await this.prisma.property.update({
        where: { id },
        data: { status: newStatus },
      });
    } else {
      await this.prisma.vehicle.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    await this.logAdminAction(
      adminId,
      dto.action === 'approve' ? 'listing_approved' : 'listing_rejected',
      type,
      id,
      { message: dto.message }
    );

    return { success: true, status: newStatus };
  }

  // Reports
  async getReports(status?: ReportStatus) {
    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status;

    const reports = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        property: {
          select: { id: true, title: true, status: true },
        },
        vehicle: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    return reports;
  }

  async resolveReport(reportId: string, dto: ResolveReportDto, adminId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Signalement non trouvé');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedAt: new Date(),
        resolvedBy: adminId,
      },
    });

    await this.logAdminAction(adminId, 'report_resolved', 'report', reportId, {
      status: dto.status,
      resolution: dto.resolution,
    });

    return updated;
  }

  // Admin Logs
  async getAdminLogs(limit = 50) {
    return this.prisma.adminLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Private helpers
  private async logAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any
  ) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details,
      },
    });
  }
}
