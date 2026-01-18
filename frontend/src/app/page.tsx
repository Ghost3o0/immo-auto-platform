'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Home, Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyCard } from '@/components/cards/property-card';
import { VehicleCard } from '@/components/cards/vehicle-card';
import { propertiesApi, vehiclesApi } from '@/lib/api';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'properties' | 'vehicles'>('properties');
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestListings();
  }, []);

  const loadLatestListings = async () => {
    try {
      const [propertiesRes, vehiclesRes] = await Promise.all([
        propertiesApi.getAll({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
        vehiclesApi.getAll({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setLatestProperties(propertiesRes.data);
      setLatestVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/${searchType}?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Trouvez votre bien idéal
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Explorez des milliers d'annonces immobilières et de véhicules. Achetez, vendez ou
              louez en toute simplicité.
            </p>

            {/* Search Box */}
            <Card className="p-6">
              <Tabs
                defaultValue="properties"
                onValueChange={(v) => setSearchType(v as 'properties' | 'vehicles')}
              >
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="properties" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Immobilier
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Véhicules
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ville, type de bien, mots-clés..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="vehicles">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Marque, modèle, mots-clés..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/properties?listingType=SALE">
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Acheter un bien</h3>
                    <p className="text-sm text-muted-foreground">Immobilier à vendre</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?listingType=RENT">
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Louer un bien</h3>
                    <p className="text-sm text-muted-foreground">Immobilier à louer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/vehicles?listingType=SALE">
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Acheter un véhicule</h3>
                    <p className="text-sm text-muted-foreground">Véhicules à vendre</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/vehicles?listingType=RENT">
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Louer un véhicule</h3>
                    <p className="text-sm text-muted-foreground">Véhicules à louer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dernières annonces immobilières</h2>
              <p className="text-muted-foreground">
                Découvrez les derniers biens ajoutés sur notre plateforme
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/properties">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-3 h-4 w-1/2 rounded bg-muted" />
                    <div className="h-6 w-1/3 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Vehicles */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dernières annonces véhicules</h2>
              <p className="text-muted-foreground">
                Trouvez le véhicule parfait parmi nos dernières annonces
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/vehicles">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-3 h-4 w-1/2 rounded bg-muted" />
                    <div className="h-6 w-1/3 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {latestVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="mb-4 text-3xl font-bold">Vendez ou louez votre bien</h2>
            <p className="mb-8 text-lg opacity-90">
              Déposez votre annonce gratuitement et trouvez rapidement des acheteurs ou locataires
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/listings/new">Déposer une annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
