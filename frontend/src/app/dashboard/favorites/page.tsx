'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyCard } from '@/components/cards/property-card';
import { VehicleCard } from '@/components/cards/vehicle-card';
import { useAuth } from '@/contexts/auth-context';
import { favoritesApi } from '@/lib/api';

export default function FavoritesPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      setProperties(response.data.properties);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleRemoveFavorite = async (id: string, type: 'property' | 'vehicle') => {
    try {
      const item = type === 'property'
        ? properties.find(p => p.id === id)
        : vehicles.find(v => v.id === id);

      if (item?.favoriteId) {
        await favoritesApi.remove(item.favoriteId);
        if (type === 'property') {
          setProperties(prev => prev.filter(p => p.id !== id));
        } else {
          setVehicles(prev => prev.filter(v => v.id !== id));
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <div className="aspect-[4/3] bg-muted" />
                <CardContent className="p-4">
                  <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalFavorites = properties.length + vehicles.length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mes favoris</h1>
        <p className="text-muted-foreground">
          {totalFavorites} annonce{totalFavorites > 1 ? 's' : ''} sauvegardée{totalFavorites > 1 ? 's' : ''}
        </p>
      </div>

      {totalFavorites === 0 ? (
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Aucun favori pour le moment</p>
          <p className="text-sm text-muted-foreground">
            Explorez les annonces et ajoutez-les à vos favoris
          </p>
        </div>
      ) : (
        <Tabs defaultValue="properties">
          <TabsList>
            <TabsTrigger value="properties">
              Immobilier ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              Véhicules ({vehicles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            {isLoadingFavorites ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <CardContent className="p-4">
                      <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Aucun favori immobilier</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onFavorite={(id) => handleRemoveFavorite(id, 'property')}
                    isFavorite={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vehicles" className="mt-6">
            {isLoadingFavorites ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <CardContent className="p-4">
                      <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Aucun favori véhicule</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onFavorite={(id) => handleRemoveFavorite(id, 'vehicle')}
                    isFavorite={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
