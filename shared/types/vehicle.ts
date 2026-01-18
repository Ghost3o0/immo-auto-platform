import { ListingType, VehicleType, FuelType, Transmission, ListingStatus } from './enums';
import { User } from './user';
import { Image } from './image';

/**
 * Interface véhicule
 */
export interface Vehicle {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  doors: number;
  seats: number;
  power?: number; // CV
  type: VehicleType;
  listingType: ListingType;
  status: ListingStatus;
  features: string[];
  images: Image[];
  city: string;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO pour la création d'un véhicule
 */
export interface CreateVehicleDto {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  doors: number;
  seats: number;
  power?: number;
  type: VehicleType;
  listingType: ListingType;
  features?: string[];
  city: string;
  images?: string[]; // Base64 encoded images
}

/**
 * DTO pour la mise à jour d'un véhicule
 */
export interface UpdateVehicleDto {
  title?: string;
  description?: string;
  price?: number;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  color?: string;
  doors?: number;
  seats?: number;
  power?: number;
  type?: VehicleType;
  listingType?: ListingType;
  status?: ListingStatus;
  features?: string[];
  city?: string;
  images?: string[];
}

/**
 * Filtres pour la recherche de véhicules
 */
export interface VehicleFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  type?: VehicleType;
  listingType?: ListingType;
  city?: string;
}

/**
 * Paramètres de requête pour les véhicules
 */
export interface VehicleQueryParams extends VehicleFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/**
 * Réponse paginée pour les véhicules
 */
export interface PaginatedVehiclesResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Liste des marques de véhicules populaires
 */
export const VEHICLE_BRANDS = [
  'Audi',
  'BMW',
  'Citroën',
  'Dacia',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Kia',
  'Mercedes-Benz',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Seat',
  'Skoda',
  'Toyota',
  'Volkswagen',
  'Volvo',
] as const;
