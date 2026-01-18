import { Property } from './property';
import { Vehicle } from './vehicle';

/**
 * Interface favoris
 */
export interface Favorite {
  id: string;
  userId: string;
  propertyId?: string;
  vehicleId?: string;
  property?: Property;
  vehicle?: Vehicle;
  createdAt: Date;
}

/**
 * DTO pour ajouter un favori
 */
export interface CreateFavoriteDto {
  propertyId?: string;
  vehicleId?: string;
}

/**
 * Réponse liste des favoris
 */
export interface FavoritesResponse {
  properties: Property[];
  vehicles: Vehicle[];
}
