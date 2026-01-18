import { UserRole } from './enums';

/**
 * Interface utilisateur de base
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Utilisateur avec mot de passe (pour le backend uniquement)
 */
export interface UserWithPassword extends User {
  password: string;
}

/**
 * DTO pour la création d'un utilisateur
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * DTO pour la mise à jour d'un utilisateur
 */
export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

/**
 * DTO pour la connexion
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO pour l'inscription
 */
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * Réponse d'authentification
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Utilisateur public (sans informations sensibles)
 */
export type PublicUser = Omit<User, 'email'>;
