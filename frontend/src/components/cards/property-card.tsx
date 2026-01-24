'use client';

import Link from 'next/link';
import { Heart, MapPin, Home, Bed, Bath, Maximize } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatSurface, truncate } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    city: string;
    surface: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    type: string;
    listingType: string;
    images: { id: string; data: string }[];
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  compact?: boolean;
}

const propertyTypeLabels: Record<string, string> = {
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  VILLA: 'Villa',
  STUDIO: 'Studio',
  LOFT: 'Loft',
  LAND: 'Terrain',
  COMMERCIAL: 'Local commercial',
  OFFICE: 'Bureau',
};

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+';

export function PropertyCard({ property, onFavorite, isFavorite, compact = false }: PropertyCardProps) {
  const isRent = property.listingType === 'RENT';
  const mainImage = property.images[0]?.data || PLACEHOLDER_IMAGE;

  if (compact) {
    // Mobile compact view - horizontal card
    return (
      <Card className="overflow-hidden">
        <Link href={`/properties/${property.id}`} className="flex">
          <div className="relative h-28 w-28 flex-shrink-0 sm:h-32 sm:w-32">
            <img
              src={mainImage}
              alt={property.title}
              className="h-full w-full object-cover"
            />
            <Badge
              variant={isRent ? 'secondary' : 'default'}
              className="absolute left-1.5 top-1.5 text-[10px] px-1.5 py-0"
            >
              {isRent ? 'Location' : 'Vente'}
            </Badge>
          </div>
          <CardContent className="flex flex-1 flex-col justify-between p-3">
            <div>
              <h3 className="line-clamp-1 text-sm font-semibold">{property.title}</h3>
              <p className="mt-0.5 flex items-center text-xs text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {property.city}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Maximize className="mr-0.5 h-3 w-3" />
                {formatSurface(property.surface)}
              </span>
              <span className="flex items-center">
                <Home className="mr-0.5 h-3 w-3" />
                {property.rooms}p
              </span>
            </div>
            <p className="mt-1 text-base font-bold text-primary">
              {formatPrice(property.price, isRent)}
            </p>
          </CardContent>
        </Link>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite(property.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg active:scale-[0.98]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/properties/${property.id}`}>
          <img
            src={mainImage}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          <Badge variant={isRent ? 'secondary' : 'default'} className="text-xs sm:text-sm">
            {isRent ? 'Location' : 'Vente'}
          </Badge>
          <Badge variant="outline" className="bg-background/80 text-xs backdrop-blur-sm sm:text-sm">
            {propertyTypeLabels[property.type] || property.type}
          </Badge>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background sm:right-3 sm:top-3 sm:h-9 sm:w-9 touch-target"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite(property.id);
            }}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="mb-1.5 sm:mb-2">
          <Link href={`/properties/${property.id}`} className="hover:underline">
            <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
              {truncate(property.title, 40)}
            </h3>
          </Link>
        </div>
        <p className="mb-2 flex items-center text-xs text-muted-foreground sm:mb-3 sm:text-sm">
          <MapPin className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {property.city}
        </p>
        <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground sm:mb-3 sm:gap-3 sm:text-sm">
          <span className="flex items-center">
            <Maximize className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {formatSurface(property.surface)}
          </span>
          <span className="flex items-center">
            <Home className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {property.rooms} pièces
          </span>
          {property.bedrooms > 0 && (
            <span className="hidden items-center xs:flex">
              <Bed className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="hidden items-center sm:flex">
              <Bath className="mr-1 h-4 w-4" />
              {property.bathrooms}
            </span>
          )}
        </div>
        <p className="text-base font-bold text-primary sm:text-lg">
          {formatPrice(property.price, isRent)}
        </p>
      </CardContent>
    </Card>
  );
}
