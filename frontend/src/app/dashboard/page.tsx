'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Car, Heart, Plus, TrendingUp, MessageCircle, Eye, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usersApi, favoritesApi, messagesApi, analyticsApi } from '@/lib/api';
import {
  ViewsChart,
  ListingsBarChart,
  StatusDoughnutChart,
  ActivityChart,
} from '@/components/charts/dashboard-charts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    vehicles: 0,
    favorites: 0,
    messages: 0,
  });
  const [chartData, setChartData] = useState({
    views: { labels: [] as string[], data: [] as number[] },
    activity: { labels: [] as string[], data: [] as number[] },
    status: { active: 0, sold: 0, rented: 0 },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadChartData();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [listingsRes, favoritesRes, messagesRes] = await Promise.all([
        usersApi.getListings(user!.id),
        favoritesApi.getAll(),
        messagesApi.getUnreadCount(),
      ]);
      setStats({
        properties: listingsRes.data.properties.length,
        vehicles: listingsRes.data.vehicles.length,
        favorites: favoritesRes.data.properties.length + favoritesRes.data.vehicles.length,
        messages: messagesRes.data.count,
      });

      // Calculate status counts
      const allListings = [...listingsRes.data.properties, ...listingsRes.data.vehicles];
      const statusCounts = allListings.reduce(
        (acc, listing) => {
          if (listing.status === 'ACTIVE') acc.active++;
          else if (listing.status === 'SOLD') acc.sold++;
          else if (listing.status === 'RENTED') acc.rented++;
          return acc;
        },
        { active: 0, sold: 0, rented: 0 }
      );
      setChartData((prev) => ({ ...prev, status: statusCounts }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const [viewsResponse, activityResponse] = await Promise.all([
        analyticsApi.getViewsStats(),
        analyticsApi.getActivityStats(),
      ]);

      setChartData((prev) => ({
        ...prev,
        views: {
          labels: viewsResponse.data.labels,
          data: viewsResponse.data.data,
        },
        activity: {
          labels: activityResponse.data.labels,
          data: activityResponse.data.data,
        },
      }));
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback to zero data for better visualization
      const labels: string[] = [];
      const zeroData: number[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(
          date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
        );
        zeroData.push(0);
      }
      setChartData((prev) => ({
        ...prev,
        views: { labels, data: zeroData },
        activity: { labels, data: zeroData },
      }));
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.name}</p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Annonces immobilières</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties}</div>
            <Link
              href="/dashboard/listings?type=properties"
              className="text-xs text-muted-foreground hover:underline"
            >
              Voir les annonces
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Annonces véhicules</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicles}</div>
            <Link
              href="/dashboard/listings?type=vehicles"
              className="text-xs text-muted-foreground hover:underline"
            >
              Voir les annonces
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <Link
              href="/dashboard/favorites"
              className="text-xs text-muted-foreground hover:underline"
            >
              Voir les favoris
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <Link
              href="/dashboard/messages"
              className="text-xs text-muted-foreground hover:underline"
            >
              Voir les messages
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vues des annonces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ViewsChart data={chartData.views} />
            </div>
          </CardContent>
        </Card>

        {/* Listings Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Annonces par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ListingsBarChart data={{ properties: stats.properties, vehicles: stats.vehicles }} />
            </div>
          </CardContent>
        </Card>

        {/* Status Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statut des annonces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <StatusDoughnutChart data={chartData.status} />
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Activité des messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ActivityChart data={chartData.activity} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/listings/new?type=property">
                <Home className="mr-2 h-4 w-4" />
                Déposer une annonce immobilière
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/listings/new?type=vehicle">
                <Car className="mr-2 h-4 w-4" />
                Déposer une annonce véhicule
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/profile">
                Modifier mon profil
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/listings">
                <Home className="mr-2 h-4 w-4" />
                Mes annonces
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/favorites">
                <Heart className="mr-2 h-4 w-4" />
                Mes favoris
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/messages">
                <MessageCircle className="mr-2 h-4 w-4" />
                Mes messages
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/properties">
                Explorer l'immobilier
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
