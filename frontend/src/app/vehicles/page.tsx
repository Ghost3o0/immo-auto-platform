'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { VehicleCard } from '@/components/cards/vehicle-card';
import { vehiclesApi, favoritesApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

const vehicleBrands = [
  'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Kia', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat',
  'Skoda', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Yamaha', 'Vespa',
];

const fuelTypes = [
  { value: 'PETROL', label: 'Essence' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Électrique' },
  { value: 'HYBRID', label: 'Hybride' },
  { value: 'LPG', label: 'GPL' },
];

const transmissions = [
  { value: 'MANUAL', label: 'Manuelle' },
  { value: 'AUTOMATIC', label: 'Automatique' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-automatique' },
];

const vehicleTypes = [
  { value: 'CAR', label: 'Voiture' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'TRUCK', label: 'Utilitaire' },
  { value: 'VAN', label: 'Camion' },
  { value: 'SUV', label: 'SUV' },
  { value: 'SCOOTER', label: 'Scooter' },
];

const listingTypes = [
  { value: 'SALE', label: 'Vente' },
  { value: 'RENT', label: 'Location' },
];

export default function VehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    type: searchParams.get('type') || '',
    listingType: searchParams.get('listingType') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadVehicles();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [page, isAuthenticated]);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      if (filters.search) params.search = filters.search;
      if (filters.brand) params.brand = filters.brand;
      if (filters.type) params.type = filters.type;
      if (filters.listingType) params.listingType = filters.listingType;
      if (filters.fuelType) params.fuelType = filters.fuelType;
      if (filters.transmission) params.transmission = filters.transmission;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
      if (filters.minYear) params.minYear = Number(filters.minYear);
      if (filters.maxMileage) params.maxMileage = Number(filters.maxMileage);

      const response = await vehiclesApi.getAll(params);
      setVehicles(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      const favoriteIds = new Set(response.data.vehicles.map((v: any) => v.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadVehicles();
  };

  const handleFavorite = async (vehicleId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (favorites.has(vehicleId)) {
        const checkResponse = await favoritesApi.check(undefined, vehicleId);
        if (checkResponse.data.favoriteId) {
          await favoritesApi.remove(checkResponse.data.favoriteId);
          setFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
          });
        }
      } else {
        await favoritesApi.add({ vehicleId });
        setFavorites((prev) => new Set(prev).add(vehicleId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      type: '',
      listingType: '',
      fuelType: '',
      transmission: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxMileage: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Annonces véhicules</h1>
        <p className="text-muted-foreground">
          {total} annonce{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Marque</Label>
                <Select
                  value={filters.brand}
                  onValueChange={(value) => setFilters({ ...filters, brand: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les marques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les marques</SelectItem>
                    {vehicleBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type de véhicule</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transaction</Label>
                <Select
                  value={filters.listingType}
                  onValueChange={(value) => setFilters({ ...filters, listingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vente/Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    {listingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Carburant</Label>
                <Select
                  value={filters.fuelType}
                  onValueChange={(value) => setFilters({ ...filters, fuelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Transmission</Label>
                <Select
                  value={filters.transmission}
                  onValueChange={(value) => setFilters({ ...filters, transmission: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    {transmissions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prix min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div>
                <Label>Prix max</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
              <div>
                <Label>Année min</Label>
                <Input
                  type="number"
                  placeholder="2010"
                  value={filters.minYear}
                  onChange={(e) => setFilters({ ...filters, minYear: e.target.value })}
                />
              </div>
              <div>
                <Label>Kilométrage max</Label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={filters.maxMileage}
                  onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Effacer
              </Button>
              <Button onClick={handleSearch}>Appliquer</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      ) : vehicles.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Aucune annonce trouvée</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onFavorite={handleFavorite}
                isFavorite={favorites.has(vehicle.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
