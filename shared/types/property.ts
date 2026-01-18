import { ListingType, PropertyType, ListingStatus } from './enums';
import { User } from './user';
import { Image } from './image';

/**
 * Interface propriété immobilière
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  type: PropertyType;
  listingType: ListingType;
  status: ListingStatus;
  features: string[];
  images: Image[];
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO pour la création d'une propriété
 */
export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  type: PropertyType;
  listingType: ListingType;
  features?: string[];
  images?: string[]; // Base64 encoded images
}

/**
 * DTO pour la mise à jour d'une propriété
 */
export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  price?: number;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  type?: PropertyType;
  listingType?: ListingType;
  status?: ListingStatus;
  features?: string[];
  images?: string[];
}

/**
 * Filtres pour la recherche de propriétés
 */
export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  type?: PropertyType;
  listingType?: ListingType;
  features?: string[];
}

/**
 * Paramètres de requête pour les propriétés
 */
export interface PropertyQueryParams extends PropertyFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'surface' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Réponse paginée pour les propriétés
 */
export interface PaginatedPropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
