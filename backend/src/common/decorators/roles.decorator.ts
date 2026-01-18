import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour définir les rôles requis pour une route
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
