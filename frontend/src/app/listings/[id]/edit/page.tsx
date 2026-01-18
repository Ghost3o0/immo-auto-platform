'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, Home, Car, ArrowLeft } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
  status: z.string().optional(),
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
  status: z.string().optional(),
  city: z.string().min(2, 'La ville est requise'),
  features: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

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

const vehicleTypes = [
  { value: 'CAR', label: 'Voiture' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'TRUCK', label: 'Utilitaire' },
  { value: 'VAN', label: 'Camion' },
  { value: 'SUV', label: 'SUV' },
  { value: 'SCOOTER', label: 'Scooter' },
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

const statusOptions = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD', label: 'Vendu' },
  { value: 'RENTED', label: 'Loué' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [listingType, setListingType] = useState<'property' | 'vehicle' | null>(null);
  const [listing, setListing] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; data: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (params.id && isAuthenticated) {
      loadListing(params.id as string);
    }
  }, [params.id, isAuthenticated]);

  const loadListing = async (id: string) => {
    setIsLoading(true);
    setError(null);

    // Try loading as property first
    try {
      const response = await propertiesApi.getOne(id);
      const property = response.data;

      // Verify ownership
      if (property.userId !== user?.id) {
        setError('Vous ne pouvez modifier que vos propres annonces');
        setIsLoading(false);
        return;
      }

      setListing(property);
      setListingType('property');
      setExistingImages(property.images || []);

      propertyForm.reset({
        title: property.title,
        description: property.description,
        price: property.price,
        address: property.address,
        city: property.city,
        zipCode: property.zipCode,
        surface: property.surface,
        rooms: property.rooms,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        type: property.type,
        listingType: property.listingType,
        status: property.status,
        features: property.features?.join(', ') || '',
      });

      setIsLoading(false);
      return;
    } catch {
      // Not a property, try vehicle
    }

    // Try loading as vehicle
    try {
      const response = await vehiclesApi.getOne(id);
      const vehicle = response.data;

      // Verify ownership
      if (vehicle.userId !== user?.id) {
        setError('Vous ne pouvez modifier que vos propres annonces');
        setIsLoading(false);
        return;
      }

      setListing(vehicle);
      setListingType('vehicle');
      setExistingImages(vehicle.images || []);

      vehicleForm.reset({
        title: vehicle.title,
        description: vehicle.description,
        price: vehicle.price,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        color: vehicle.color,
        doors: vehicle.doors,
        seats: vehicle.seats,
        power: vehicle.power || undefined,
        type: vehicle.type,
        listingType: vehicle.listingType,
        status: vehicle.status,
        city: vehicle.city,
        features: vehicle.features?.join(', ') || '',
      });

      setIsLoading(false);
      return;
    } catch {
      setError('Annonce non trouvée');
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = existingImages.length + images.length;
    Array.from(files).forEach((file) => {
      if (totalImages + images.length >= 10) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmitProperty = async (data: PropertyFormData) => {
    setError(null);
    try {
      const features = data.features
        ? data.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      // Combine existing and new images
      const allImages = [
        ...existingImages.map((img) => img.data),
        ...images,
      ];

      await propertiesApi.update(listing.id, {
        ...data,
        features,
        images: allImages.length > 0 ? allImages : undefined,
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

      // Combine existing and new images
      const allImages = [
        ...existingImages.map((img) => img.data),
        ...images,
      ];

      await vehiclesApi.update(listing.id, {
        ...data,
        features,
        images: allImages.length > 0 ? allImages : undefined,
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

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (listingType === 'property') {
        await propertiesApi.delete(listing.id);
      } else {
        await vehiclesApi.delete(listing.id);
      }
      router.push('/dashboard/listings');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la suppression');
      }
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="h-96 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="container py-8">
        <div className="rounded-md bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!listing || !listingType) {
    return null;
  }

  const totalImages = existingImages.length + images.length;

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {listingType === 'property' ? (
              <Home className="h-6 w-6" />
            ) : (
              <Car className="h-6 w-6" />
            )}
            <h1 className="text-3xl font-bold">Modifier l'annonce</h1>
          </div>
          <p className="text-muted-foreground">
            Modifiez les informations de votre annonce
          </p>
        </div>
        <Badge variant={listing.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {statusOptions.find((s) => s.value === listing.status)?.label || listing.status}
        </Badge>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {listingType === 'property' ? (
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
                    {/* Existing Images */}
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-24 w-32 overflow-hidden rounded-md"
                      >
                        <img src={img.data} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                          onClick={() => removeExistingImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {/* New Images */}
                    {images.map((img, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative h-24 w-32 overflow-hidden rounded-md ring-2 ring-primary"
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-xs text-primary-foreground">
                          Nouveau
                        </span>
                      </div>
                    ))}
                    {totalImages < 10 && (
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
                    {totalImages}/10 images. Formats acceptés : JPG, PNG, WebP.
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
                    <Select
                      value={propertyForm.watch('type')}
                      onValueChange={(v) => propertyForm.setValue('type', v)}
                    >
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
                    <Select
                      value={propertyForm.watch('listingType')}
                      onValueChange={(v) => propertyForm.setValue('listingType', v)}
                    >
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
                    <Label htmlFor="price">Prix (EUR)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...propertyForm.register('price', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={propertyForm.watch('status')}
                      onValueChange={(v) => propertyForm.setValue('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer l\'annonce'
              )}
            </Button>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={propertyForm.formState.isSubmitting}>
                {propertyForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          </div>
        </form>
      ) : (
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
                    {/* Existing Images */}
                    {existingImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-24 w-32 overflow-hidden rounded-md"
                      >
                        <img src={img.data} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                          onClick={() => removeExistingImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {/* New Images */}
                    {images.map((img, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative h-24 w-32 overflow-hidden rounded-md ring-2 ring-primary"
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-xs text-primary-foreground">
                          Nouveau
                        </span>
                      </div>
                    ))}
                    {totalImages < 10 && (
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
                    {totalImages}/10 images. Formats acceptés : JPG, PNG, WebP.
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
                    <Select
                      value={vehicleForm.watch('type')}
                      onValueChange={(v) => vehicleForm.setValue('type', v)}
                    >
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
                    <Select
                      value={vehicleForm.watch('listingType')}
                      onValueChange={(v) => vehicleForm.setValue('listingType', v)}
                    >
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
                    <Label htmlFor="v-status">Statut</Label>
                    <Select
                      value={vehicleForm.watch('status')}
                      onValueChange={(v) => vehicleForm.setValue('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="v-city">Ville</Label>
                  <Input id="v-city" {...vehicleForm.register('city')} />
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
                    <Select
                      value={vehicleForm.watch('fuelType')}
                      onValueChange={(v) => vehicleForm.setValue('fuelType', v)}
                    >
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
                    <Select
                      value={vehicleForm.watch('transmission')}
                      onValueChange={(v) => vehicleForm.setValue('transmission', v)}
                    >
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

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer l\'annonce'
              )}
            </Button>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={vehicleForm.formState.isSubmitting}>
                {vehicleForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
