import { apiClient } from './api';

// Types
export interface AdminDashboardStats {
  users: { total: number; active: number };
  listings: { properties: number; vehicles: number; pendingModeration: number };
  reports: { pending: number };
  recentActivity: { newUsersThisWeek: number };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  _count: { properties: number; vehicles: number };
}

export interface AdminListing {
  id: string;
  title: string;
  price: number;
  status: string;
  type: 'property' | 'vehicle';
  createdAt: string;
  user: { id: string; name: string; email: string };
  images: { id: string; data: string }[];
  reportsCount: number;
}

export interface Report {
  id: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reporter: { id: string; name: string; email: string };
  property?: { id: string; title: string; status: string };
  vehicle?: { id: string; title: string; status: string };
}

// API functions
export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<{ data: AdminDashboardStats }> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AdminUser[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: 'USER' | 'ADMIN') => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (
    id: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
    reason?: string
  ) => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status, reason });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Listings
  getListings: async (params?: {
    type?: 'property' | 'vehicle';
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AdminListing[]; page: number; total: number }> => {
    const response = await apiClient.get('/admin/listings', { params });
    return response.data;
  },

  getListing: async (type: 'property' | 'vehicle', id: string) => {
    const response = await apiClient.get(`/admin/listings/${type}/${id}`);
    return response.data;
  },

  updateListingStatus: async (
    type: 'property' | 'vehicle',
    id: string,
    status: string,
    reason?: string
  ) => {
    const response = await apiClient.patch(`/admin/listings/${type}/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  deleteListing: async (type: 'property' | 'vehicle', id: string) => {
    const response = await apiClient.delete(`/admin/listings/${type}/${id}`);
    return response.data;
  },

  // Moderation
  getPendingListings: async () => {
    const response = await apiClient.get('/admin/moderation/pending');
    return response.data;
  },

  moderateListing: async (
    type: 'property' | 'vehicle',
    id: string,
    action: 'approve' | 'reject',
    message?: string
  ) => {
    const response = await apiClient.post(`/admin/moderation/${type}/${id}`, {
      action,
      message,
    });
    return response.data;
  },

  // Reports
  getReports: async (status?: string): Promise<Report[]> => {
    const response = await apiClient.get('/admin/reports', { params: { status } });
    return response.data;
  },

  resolveReport: async (
    id: string,
    status: 'RESOLVED' | 'DISMISSED',
    resolution?: string
  ) => {
    const response = await apiClient.patch(`/admin/reports/${id}`, { status, resolution });
    return response.data;
  },

  // Logs
  getAdminLogs: async (limit?: number) => {
    const response = await apiClient.get('/admin/logs', { params: { limit } });
    return response.data;
  },
};
