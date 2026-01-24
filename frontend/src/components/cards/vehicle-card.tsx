'use client';

import Link from 'next/link';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatMileage, truncate } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: {
    id: string;
    title: string;
    description: string;
    price: number;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    city: string;
    type: string;
    listingType: string;
    images: { id: string; data: string }[];
  };
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const fuelTypeLabels: Record<string, string> = {
  PETROL: 'Essence',
  DIESEL: 'Diesel',
  ELECTRIC: 'Électrique',
  HYBRID: 'Hybride',
  LPG: 'GPL',
};

const transmissionLabels: Record<string, string> = {
  MANUAL: 'Manuelle',
  AUTOMATIC: 'Automatique',
  SEMI_AUTOMATIC: 'Semi-auto',
};

const vehicleTypeLabels: Record<string, string> = {
  CAR: 'Voiture',
  MOTORCYCLE: 'Moto',
  TRUCK: 'Utilitaire',
  VAN: 'Camion',
  SUV: 'SUV',
  SCOOTER: 'Scooter',
};

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+';

export function VehicleCard({ vehicle, onFavorite, isFavorite }: VehicleCardProps) {
  const isRent = vehicle.listingType === 'RENT';
  const mainImage = vehicle.images[0]?.data || PLACEHOLDER_IMAGE;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/vehicles/${vehicle.id}`}>
          <img
            src={mainImage}
            alt={vehicle.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={isRent ? 'secondary' : 'default'}>
            {isRent ? 'Location' : 'Vente'}
          </Badge>
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {vehicleTypeLabels[vehicle.type] || vehicle.type}
          </Badge>
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              onFavorite(vehicle.id);
            }}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <Link href={`/vehicles/${vehicle.id}`} className="hover:underline">
            <h3 className="font-semibold">{truncate(vehicle.title, 40)}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            {vehicle.brand} {vehicle.model}
          </p>
        </div>
        <p className="mb-3 flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          {vehicle.city}
        </p>
        <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {vehicle.year}
          </span>
          <span className="flex items-center">
            <Gauge className="mr-1 h-4 w-4" />
            {formatMileage(vehicle.mileage)}
          </span>
          <span className="flex items-center">
            <Fuel className="mr-1 h-4 w-4" />
            {fuelTypeLabels[vehicle.fuelType] || vehicle.fuelType}
          </span>
          <span className="flex items-center">
            <Settings className="mr-1 h-4 w-4" />
            {transmissionLabels[vehicle.transmission] || vehicle.transmission}
          </span>
        </div>
        <p className="text-lg font-bold text-primary">
          {formatPrice(vehicle.price, isRent)}
          {isRent && <span className="text-sm font-normal">/jour</span>}
        </p>
      </CardContent>
    </Card>
  );
}
