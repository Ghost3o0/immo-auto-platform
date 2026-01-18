'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Car, Heart, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usersApi, favoritesApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    vehicles: 0,
    favorites: 0,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [listingsRes, favoritesRes] = await Promise.all([
        usersApi.getListings(user!.id),
        favoritesApi.getAll(),
      ]);
      setStats({
        properties: listingsRes.data.properties.length,
        vehicles: listingsRes.data.vehicles.length,
        favorites: favoritesRes.data.properties.length + favoritesRes.data.vehicles.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total annonces</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.properties + stats.vehicles}</div>
            <Link
              href="/dashboard/listings"
              className="text-xs text-muted-foreground hover:underline"
            >
              Gérer les annonces
            </Link>
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
              <Link href="/listings/new">
                <Plus className="mr-2 h-4 w-4" />
                Déposer une annonce immobilière
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/listings/new">
                <Plus className="mr-2 h-4 w-4" />
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
              <Link href="/properties">
                Explorer l'immobilier
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/vehicles">
                Explorer les véhicules
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
