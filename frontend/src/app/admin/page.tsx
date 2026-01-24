'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Home,
  Car,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi, AdminDashboardStats } from '@/lib/admin-api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 sm:px-6 md:px-0 sm:space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-6">
                <div className="h-20 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 md:px-0 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard Administrateur</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users.active || 0} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
              Immobilier
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats?.listings.properties || 0}</div>
            <p className="text-xs text-muted-foreground">Propriétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
              Véhicules
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{stats?.listings.vehicles || 0}</div>
            <p className="text-xs text-muted-foreground">Publiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
              Inscriptions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">
              {stats?.recentActivity.newUsersThisWeek || 0}
            </div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
        {/* Pending Moderation */}
        <Card className={stats?.listings.pendingModeration ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
              <span className="line-clamp-2">En attente de modération</span>
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto" asChild>
              <Link href="/admin/moderation">
                Voir
                <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">
              {stats?.listings.pendingModeration || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Annonces en attente
            </p>
          </CardContent>
        </Card>

        {/* Pending Reports */}
        <Card className={stats?.reports.pending ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
              <span className="line-clamp-2">Signalements</span>
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto" asChild>
              <Link href="/admin/reports">
                Voir
                <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">{stats?.reports.pending || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              À traiter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="text-sm sm:text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-2 px-3 pb-3 sm:px-6 sm:pb-6">
          <Button asChild className="w-full sm:w-auto text-xs sm:text-sm">
            <Link href="/admin/users">Gérer les utilisateurs</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
            <Link href="/admin/listings">Voir toutes les annonces</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
            <Link href="/admin/moderation">Modérer les annonces</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}