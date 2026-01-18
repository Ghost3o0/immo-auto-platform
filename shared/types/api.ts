/**
 * Types API communs
 */

/**
 * Réponse API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Réponse d'erreur API
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paramètres de tri
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Résultat de recherche globale
 */
export interface SearchResult {
  properties: {
    id: string;
    title: string;
    price: number;
    city: string;
    type: string;
  }[];
  vehicles: {
    id: string;
    title: string;
    price: number;
    brand: string;
    model: string;
  }[];
}
