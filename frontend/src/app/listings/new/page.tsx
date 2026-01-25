'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, Home, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { propertiesApi, vehiclesApi, ApiError } from '@/lib/api';

const propertySchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  zipCode: z.string().min(2, 'Le code postal est requis'),
  surface: z.number().min(1, 'La surface doit être positive'),
  rooms: z.number().min(1, 'Le nombre de pièces doit être au moins 1'),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  type: z.string().min(1, 'Le type est requis'),
  listingType: z.string().min(1, 'Le type de transaction est requis'),
  features: z.string().optional(),
});

const vehicleSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  fuelType: z.string().min(1, 'Le carburant est requis'),
  transmission: z.string().min(1, 'La transmission est requise'),
  color: z.string().min(1, 'La couleur est requise'),
  doors: z.number().min(0),
  seats: z.number().min(1),
  power: z.number().optional(),
  type: z.string().min(1, 'Le type est requis'),
  listingType: z.string().min(1, 'Le type de transaction est requis'),
  city: z.string().min(2, 'La ville est requise'),
  features: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

const propertyTypes = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OTHER', label: 'Autre' },
];

const vehicleTypes = [
  { value: 'CAR', label: 'Voiture' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'TRUCK', label: 'Camion' },
  { value: 'VAN', label: 'Utilitaire' },
  { value: 'OTHER', label: 'Autre' },
];

const fuelTypes = [
  { value: 'PETROL', label: 'Essence' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Électrique' },
  { value: 'HYBRID', label: 'Hybride' },
  { value: 'LPG', label: 'GPL' },
  { value: 'OTHER', label: 'Autre' },
];

const transmissions = [
  { value: 'MANUAL', label: 'Manuelle' },
  { value: 'AUTOMATIC', label: 'Automatique' },
];

function NewListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isAuthenticated } = useAuth();
  const initialType = searchParams.get('type') === 'vehicle' ? 'vehicle' : 'property';
  const [listingType, setListingType] = useState<'property' | 'vehicle'>(initialType);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Update listing type when URL param changes
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'vehicle' || typeParam === 'property') {
      setListingType(typeParam);
    }
  }, [searchParams]);

  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      mileage: 0,
      doors: 5,
      seats: 5,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 10) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitProperty = async (data: PropertyFormData) => {
    setError(null);
    try {
      const features = data.features
        ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      await propertiesApi.create({
        ...data,
        features,
        images: images.length > 0 ? images : undefined,
      });

      router.push('/dashboard/listings');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
    }
  };

  const onSubmitVehicle = async (data: VehicleFormData) => {
    setError(null);
    try {
      const features = data.features
        ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      await vehiclesApi.create({
        ...data,
        features,
        images: images.length > 0 ? images : undefined,
      });

      router.push('/dashboard/listings');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue');
      }
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="h-96 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nouvelle annonce</h1>
        <p className="text-muted-foreground">
          Créez une nouvelle annonce immobilière ou véhicule
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs
        value={listingType}
        onValueChange={(v) => {
          setListingType(v as 'property' | 'vehicle');
          setImages([]);
        }}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Immobilier
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Véhicule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property">
          <form onSubmit={propertyForm.handleSubmit(onSubmitProperty)}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Images */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative h-24 w-32 overflow-hidden rounded-md"
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {images.length < 10 && (
                        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                          <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Ajouter</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum 10 images. Formats acceptés : JPG, PNG, WebP.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" {...propertyForm.register('title')} />
                    {propertyForm.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {propertyForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={5} {...propertyForm.register('description')} />
                    {propertyForm.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {propertyForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type de bien</Label>
                      <Select onValueChange={(v) => propertyForm.setValue('type', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="listingType">Transaction</Label>
                      <Select onValueChange={(v) => propertyForm.setValue('listingType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALE">Vente</SelectItem>
                          <SelectItem value="RENT">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">Prix (EUR)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...propertyForm.register('price', { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" {...propertyForm.register('address')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input id="city" {...propertyForm.register('city')} />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Code postal</Label>
                      <Input id="zipCode" {...propertyForm.register('zipCode')} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="surface">Surface (m²)</Label>
                      <Input
                        id="surface"
                        type="number"
                        {...propertyForm.register('surface', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rooms">Pièces</Label>
                      <Input
                        id="rooms"
                        type="number"
                        {...propertyForm.register('rooms', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bedrooms">Chambres</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        {...propertyForm.register('bedrooms', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Salles de bain</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        {...propertyForm.register('bathrooms', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="features">Équipements (séparés par des virgules)</Label>
                    <Textarea
                      id="features"
                      placeholder="Balcon, Parking, Cave, Ascenseur..."
                      {...propertyForm.register('features')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={propertyForm.formState.isSubmitting}>
                {propertyForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  'Publier l\'annonce'
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="vehicle">
          <form onSubmit={vehicleForm.handleSubmit(onSubmitVehicle)}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Images */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative h-24 w-32 overflow-hidden rounded-md"
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {images.length < 10 && (
                        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                          <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Ajouter</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum 10 images. Formats acceptés : JPG, PNG, WebP.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="v-title">Titre</Label>
                    <Input id="v-title" {...vehicleForm.register('title')} />
                  </div>
                  <div>
                    <Label htmlFor="v-description">Description</Label>
                    <Textarea id="v-description" rows={5} {...vehicleForm.register('description')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="v-type">Type de véhicule</Label>
                      <Select onValueChange={(v) => vehicleForm.setValue('type', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="v-listingType">Transaction</Label>
                      <Select onValueChange={(v) => vehicleForm.setValue('listingType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALE">Vente</SelectItem>
                          <SelectItem value="RENT">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="v-price">Prix (EUR)</Label>
                      <Input
                        id="v-price"
                        type="number"
                        {...vehicleForm.register('price', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="v-city">Ville</Label>
                      <Input id="v-city" {...vehicleForm.register('city')} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails du véhicule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Marque</Label>
                      <Input id="brand" {...vehicleForm.register('brand')} />
                    </div>
                    <div>
                      <Label htmlFor="model">Modèle</Label>
                      <Input id="model" {...vehicleForm.register('model')} />
                    </div>
                    <div>
                      <Label htmlFor="year">Année</Label>
                      <Input
                        id="year"
                        type="number"
                        {...vehicleForm.register('year', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileage">Kilométrage</Label>
                      <Input
                        id="mileage"
                        type="number"
                        {...vehicleForm.register('mileage', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Couleur</Label>
                      <Input id="color" {...vehicleForm.register('color')} />
                    </div>
                    <div>
                      <Label htmlFor="power">Puissance (CV)</Label>
                      <Input
                        id="power"
                        type="number"
                        {...vehicleForm.register('power', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelType">Carburant</Label>
                      <Select onValueChange={(v) => vehicleForm.setValue('fuelType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transmission">Transmission</Label>
                      <Select onValueChange={(v) => vehicleForm.setValue('transmission', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="doors">Portes</Label>
                      <Input
                        id="doors"
                        type="number"
                        {...vehicleForm.register('doors', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seats">Places</Label>
                      <Input
                        id="seats"
                        type="number"
                        {...vehicleForm.register('seats', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="v-features">Équipements (séparés par des virgules)</Label>
                    <Textarea
                      id="v-features"
                      placeholder="GPS, Climatisation, Bluetooth..."
                      {...vehicleForm.register('features')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={vehicleForm.formState.isSubmitting}>
                {vehicleForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  'Publier l\'annonce'
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Chargement...</div>}>
      <NewListingContent />
    </Suspense>
  );
}
