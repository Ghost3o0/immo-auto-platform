import { IsString, IsOptional, IsUUID, MinLength, IsIn } from 'class-validator';
import { UserRole, UserStatus, ListingStatus, ReportStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

// User management DTOs
export class UpdateUserRoleDto {
  @IsIn(['USER', 'ADMIN'])
  role: UserRole;
}

export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

// Listing management DTOs
export class UpdateListingStatusDto {
  @IsIn(['DRAFT', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE'])
  status: ListingStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ModerationActionDto {
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  message?: string;
}

// Report management DTOs
export class ResolveReportDto {
  @IsIn(['PENDING', 'RESOLVED', 'DISMISSED'])
  status: ReportStatus;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class CreateReportDto {
  @IsString()
  @MinLength(10)
  reason: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}

// Query DTOs
export class AdminListingsQueryDto {
  @IsOptional()
  @IsIn(['property', 'vehicle'])
  type?: 'property' | 'vehicle';

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE'])
  status?: ListingStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;
}

export class AdminUsersQueryDto {
  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: UserRole;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  status?: UserStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;
}
