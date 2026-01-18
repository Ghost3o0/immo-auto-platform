'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { usersApi, propertiesApi, vehiclesApi } from '@/lib/api';
import { formatPrice, truncate } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Brouillon',
  SOLD: 'Vendu',
  RENTED: 'Loué',
  INACTIVE: 'Inactive',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
  ACTIVE: 'success',
  DRAFT: 'secondary',
  SOLD: 'default',
  RENTED: 'default',
  INACTIVE: 'destructive',
};

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'property' | 'vehicle' } | null>(null);

  const defaultTab = searchParams.get('type') === 'vehicles' ? 'vehicles' : 'properties';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      const response = await usersApi.getListings(user!.id);
      setProperties(response.data.properties);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'property') {
        await propertiesApi.delete(itemToDelete.id);
        setProperties((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      } else {
        await vehiclesApi.delete(itemToDelete.id);
        setVehicles((prev) => prev.filter((v) => v.id !== itemToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-muted" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ListingCard = ({ item, type }: { item: any; type: 'property' | 'vehicle' }) => (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {item.images?.[0] ? (
            <img
              src={item.images[0].data}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Pas d'image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{item.title}</h3>
          <p className="text-sm text-muted-foreground">
            {type === 'property' ? item.city : `${item.brand} ${item.model}`}
          </p>
          <p className="text-sm font-medium text-primary">
            {formatPrice(item.price, item.listingType === 'RENT')}
          </p>
        </div>
        <Badge variant={statusColors[item.status] as any}>
          {statusLabels[item.status]}
        </Badge>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={type === 'property' ? `/properties/${item.id}` : `/vehicles/${item.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/listings/${item.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              setItemToDelete({ id: item.id, type });
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes annonces</h1>
          <p className="text-muted-foreground">
            Gérez vos annonces immobilières et véhicules
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="properties">
            Immobilier ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            Véhicules ({vehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          {isLoadingListings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">Aucune annonce immobilière</p>
              <Button asChild>
                <Link href="/listings/new">Créer une annonce</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <ListingCard key={property.id} item={property} type="property" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          {isLoadingListings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">Aucune annonce véhicule</p>
              <Button asChild>
                <Link href="/listings/new">Créer une annonce</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <ListingCard key={vehicle.id} item={vehicle} type="vehicle" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
