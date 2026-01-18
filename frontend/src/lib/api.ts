const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Options de requête fetch
 */
interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Récupère le token d'authentification
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Construit l'URL avec les paramètres de requête
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Effectue une requête API
 */
async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'Une erreur est survenue',
      data.errors
    );
  }

  return data;
}

/**
 * API Auth
 */
export const authApi = {
  register: (body: { email: string; password: string; name: string; phone?: string }) =>
    fetchApi<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    fetchApi<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    fetchApi<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetchApi<{ success: boolean; data: any }>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    fetchApi<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

/**
 * API Properties
 */
export const propertiesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    type?: string;
    listingType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) =>
    fetchApi<{
      success: boolean;
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/properties', { params }),

  getOne: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/properties/${id}`),

  create: (body: any) =>
    fetchApi<{ success: boolean; data: any }>('/properties', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: any) =>
    fetchApi<{ success: boolean; data: any }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    fetchApi<{ success: boolean; data: any }>(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/**
 * API Vehicles
 */
export const vehiclesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    brand?: string;
    model?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    maxMileage?: number;
    fuelType?: string;
    transmission?: string;
    type?: string;
    listingType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) =>
    fetchApi<{
      success: boolean;
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/vehicles', { params }),

  getOne: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/vehicles/${id}`),

  create: (body: any) =>
    fetchApi<{ success: boolean; data: any }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: any) =>
    fetchApi<{ success: boolean; data: any }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/vehicles/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    fetchApi<{ success: boolean; data: any }>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/**
 * API Favorites
 */
export const favoritesApi = {
  getAll: () =>
    fetchApi<{ success: boolean; data: { properties: any[]; vehicles: any[] } }>('/favorites'),

  add: (body: { propertyId?: string; vehicleId?: string }) =>
    fetchApi<{ success: boolean; data: any }>('/favorites', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    fetchApi<{ success: boolean }>(`/favorites/${id}`, {
      method: 'DELETE',
    }),

  check: (propertyId?: string, vehicleId?: string) =>
    fetchApi<{ success: boolean; data: { isFavorite: boolean; favoriteId?: string } }>('/favorites/check', {
      params: { propertyId, vehicleId },
    }),
};

/**
 * API Search
 */
export const searchApi = {
  search: (query: string, page = 1, limit = 10) =>
    fetchApi<{ success: boolean; data: { properties: any[]; vehicles: any[] } }>('/search', {
      params: { query, page, limit },
    }),

  suggestions: (query: string) =>
    fetchApi<{ success: boolean; data: { type: string; id: string | null; label: string }[] }>('/search/suggestions', {
      params: { query },
    }),
};

/**
 * API Users
 */
export const usersApi = {
  getOne: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}`),

  update: (id: string, body: any) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  changePassword: (id: string, body: { currentPassword: string; newPassword: string }) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  getListings: (id: string) =>
    fetchApi<{ success: boolean; data: { properties: any[]; vehicles: any[] } }>(`/users/${id}/listings`),

  getNotificationPreferences: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}/notification-preferences`),

  updateNotificationPreferences: (id: string, body: any) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}/notification-preferences`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

/**
 * API Messages
 */
export const messagesApi = {
  // Créer une conversation
  createConversation: (data: { sellerId: string; propertyId?: string; vehicleId?: string; message: string }) =>
    fetchApi<{ success: boolean; data: any }>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Récupérer toutes les conversations
  getConversations: () =>
    fetchApi<{ success: boolean; data: any[] }>('/messages/conversations'),

  // Récupérer une conversation
  getConversation: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/messages/conversations/${id}`),

  // Envoyer un message
  sendMessage: (conversationId: string, content: string) =>
    fetchApi<{ success: boolean; data: any }>(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Compter les messages non lus
  getUnreadCount: () =>
    fetchApi<{ success: boolean; data: { count: number } }>('/messages/unread'),

  // Marquer comme lu
  markAsRead: (conversationId: string) =>
    fetchApi<{ success: boolean }>(`/messages/conversations/${conversationId}/read`, {
      method: 'POST',
    }),
};
/**
 * API Analytics
 */
export const analyticsApi = {
  getViewsStats: () =>
    fetchApi<{ success: boolean; data: { labels: string[]; data: number[]; total: number } }>('/analytics/views'),

  getActivityStats: () =>
    fetchApi<{ success: boolean; data: { labels: string[]; data: number[]; total: number } }>('/analytics/activity'),
};