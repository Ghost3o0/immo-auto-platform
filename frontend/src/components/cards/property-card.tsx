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

export function PropertyCard({ property, onFavorite, isFavorite }: PropertyCardProps) {
  const isRent = property.listingType === 'RENT';
  const mainImage = property.images[0]?.data || '/placeholder.jpg';

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/properties/${property.id}`}>
          <img
            src={mainImage}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={isRent ? 'secondary' : 'default'}>
            {isRent ? 'Location' : 'Vente'}
          </Badge>
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {propertyTypeLabels[property.type] || property.type}
          </Badge>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              onFavorite(property.id);
            }}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link href={`/properties/${property.id}`} className="hover:underline">
            <h3 className="font-semibold">{truncate(property.title, 40)}</h3>
          </Link>
        </div>
        <p className="mb-3 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          {property.city}
        </p>
        <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center">
            <Maximize className="mr-1 h-4 w-4" />
            {formatSurface(property.surface)}
          </span>
          <span className="flex items-center">
            <Home className="mr-1 h-4 w-4" />
            {property.rooms} pièces
          </span>
          {property.bedrooms > 0 && (
            <span className="flex items-center">
              <Bed className="mr-1 h-4 w-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center">
              <Bath className="mr-1 h-4 w-4" />
              {property.bathrooms}
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-primary">
          {formatPrice(property.price, isRent)}
        </p>
      </CardContent>
    </Card>
  );
}
