'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
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
import { PropertyCard } from '@/components/cards/property-card';
import { Drawer } from '@/components/ui/drawer';
import { propertiesApi, favoritesApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

const propertyTypes = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OFFICE', label: 'Bureau' },
];

const listingTypes = [
  { value: 'SALE', label: 'Vente' },
  { value: 'RENT', label: 'Location' },
];

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minSurface: searchParams.get('minSurface') || '',
    maxSurface: searchParams.get('maxSurface') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadProperties();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [page, isAuthenticated]);

  const loadProperties = async () => {
    loadPropertiesWithFilters(filters, page);
  };

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      const favoriteIds = new Set(response.data.properties.map((p: any) => p.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = (newFilters?: typeof filters) => {
    const searchFilters = newFilters || filters;
    setPage(1);
    loadPropertiesWithFilters(searchFilters, 1);
  };

  const loadPropertiesWithFilters = async (searchFilters: typeof filters, currentPage: number) => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
        sortBy: searchFilters.sortBy,
        sortOrder: searchFilters.sortOrder,
      };

      if (searchFilters.search) params.search = searchFilters.search;
      if (searchFilters.city) params.city = searchFilters.city;
      if (searchFilters.type) params.type = searchFilters.type;
      if (searchFilters.listingType) params.listingType = searchFilters.listingType;
      if (searchFilters.minPrice) params.minPrice = Number(searchFilters.minPrice);
      if (searchFilters.maxPrice) params.maxPrice = Number(searchFilters.maxPrice);
      if (searchFilters.minSurface) params.minSurface = Number(searchFilters.minSurface);
      if (searchFilters.maxSurface) params.maxSurface = Number(searchFilters.maxSurface);

      const response = await propertiesApi.getAll(params);
      setProperties(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (propertyId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (favorites.has(propertyId)) {
        const checkResponse = await favoritesApi.check({ propertyId });
        if (checkResponse.data.favoriteId) {
          await favoritesApi.remove(checkResponse.data.favoriteId);
          setFavorites((prev) => {
            const newSet = new Set(prev);
            newSet.delete(propertyId);
            return newSet;
          });
        }
      } else {
        await favoritesApi.add({ propertyId });
        setFavorites((prev) => new Set(prev).add(propertyId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      type: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      minSurface: '',
      maxSurface: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  // Filter content component for reuse
  const FilterContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className={inDrawer ? 'space-y-4' : 'grid gap-4 md:grid-cols-4'}>
      <div>
        <Label>Ville</Label>
        <Input
          placeholder="Paris, Lyon..."
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Type de bien</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {propertyTypes.map((type) => (
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
          value={filters.listingType || 'all'}
          onValueChange={(value) => setFilters({ ...filters, listingType: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Vente/Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {listingTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={inDrawer ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <Label>Prix min</Label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="mt-1.5"
          />
        </div>
        {inDrawer && (
          <div>
            <Label>Prix max</Label>
            <Input
              type="number"
              placeholder="1000000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="mt-1.5"
            />
          </div>
        )}
      </div>
      {!inDrawer && (
        <div>
          <Label>Prix max</Label>
          <Input
            type="number"
            placeholder="1000000"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="mt-1.5"
          />
        </div>
      )}
      <div className={inDrawer ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <Label>Surface min (m²)</Label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minSurface}
            onChange={(e) => setFilters({ ...filters, minSurface: e.target.value })}
            className="mt-1.5"
          />
        </div>
        {inDrawer && (
          <div>
            <Label>Surface max (m²)</Label>
            <Input
              type="number"
              placeholder="500"
              value={filters.maxSurface}
              onChange={(e) => setFilters({ ...filters, maxSurface: e.target.value })}
              className="mt-1.5"
            />
          </div>
        )}
      </div>
      {!inDrawer && (
        <div>
          <Label>Surface max (m²)</Label>
          <Input
            type="number"
            placeholder="500"
            value={filters.maxSurface}
            onChange={(e) => setFilters({ ...filters, maxSurface: e.target.value })}
            className="mt-1.5"
          />
        </div>
      )}
      <div className={`flex gap-2 ${inDrawer ? 'mt-6' : 'md:col-span-4 mt-4 justify-end'}`}>
        <Button variant="outline" onClick={clearFilters} className={inDrawer ? 'flex-1' : ''}>
          <X className="mr-2 h-4 w-4" />
          Effacer
        </Button>
        <Button onClick={() => { handleSearch(); setShowFilters(false); }} className={inDrawer ? 'flex-1' : ''}>
          Appliquer
        </Button>
      </div>
    </div>
  );

  const activeFiltersCount = [
    filters.city,
    filters.type,
    filters.listingType,
    filters.minPrice,
    filters.maxPrice,
    filters.minSurface,
    filters.maxSurface,
  ].filter(Boolean).length;

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Annonces immobilières</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {total} annonce{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex gap-2 sm:mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="h-11 pr-10 sm:h-10"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSearch}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile: Icon button with badge, Desktop: Full button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative h-11 w-11 sm:h-10 sm:w-auto sm:px-4"
        >
          <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground sm:static sm:ml-2 sm:h-auto sm:w-auto sm:rounded sm:bg-primary/20 sm:px-1.5 sm:py-0.5 sm:text-xs sm:text-primary">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop Filters Panel */}
      {showFilters && (
        <Card className="mb-6 hidden md:block">
          <CardContent className="p-6">
            <FilterContent />
          </CardContent>
        </Card>
      )}

      {/* Mobile Filters Drawer */}
      <Drawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtres"
      >
        <div className="md:hidden">
          <FilterContent inDrawer />
        </div>
      </Drawer>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <CardContent className="p-3 sm:p-4">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted sm:h-5" />
                <div className="mb-2 h-3 w-1/2 rounded bg-muted sm:mb-3 sm:h-4" />
                <div className="h-5 w-1/3 rounded bg-muted sm:h-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-base text-muted-foreground sm:text-lg">Aucune annonce trouvée</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavorite={handleFavorite}
                isFavorite={favorites.has(property.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center sm:mt-8">
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

function PropertiesPageLoading() {
  return (
    <div className="container py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-3 sm:p-4">
              <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
              <div className="h-5 w-1/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesPageLoading />}>
      <PropertiesContent />
    </Suspense>
  );
}
