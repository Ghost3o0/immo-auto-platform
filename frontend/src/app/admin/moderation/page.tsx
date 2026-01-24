'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, Eye, Home, Car, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';

interface PendingListing {
  id: string;
  title: string;
  price: number;
  type: 'property' | 'vehicle';
  createdAt: string;
  user: { id: string; name: string; email: string };
  images: { id: string; data: string }[];
  city?: string;
  brand?: string;
  model?: string;
}

export default function AdminModerationPage() {
  const [properties, setProperties] = useState<PendingListing[]>([]);
  const [vehicles, setVehicles] = useState<PendingListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPendingListings();
  }, []);

  const loadPendingListings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPendingListings();
      setProperties(response.properties || []);
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Error loading pending listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (listing: PendingListing) => {
    setProcessing(true);
    try {
      await adminApi.moderateListing(listing.type, listing.id, 'approve');
      showToast(`Annonce "${listing.title}" approuvée avec succès`, 'success');
      loadPendingListings();
    } catch (error) {
      console.error('Error approving listing:', error);
      showToast('Erreur lors de l\'approbation de l\'annonce', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;
    if (!rejectReason.trim()) {
      showToast('Veuillez indiquer une raison de rejet', 'error');
      return;
    }
    setProcessing(true);
    try {
      await adminApi.moderateListing(
        selectedListing.type,
        selectedListing.id,
        'reject',
        rejectReason
      );
      showToast(`Annonce "${selectedListing.title}" rejetée`, 'success');
      setRejectDialogOpen(false);
      setSelectedListing(null);
      setRejectReason('');
      loadPendingListings();
    } catch (error) {
      console.error('Error rejecting listing:', error);
      showToast('Erreur lors du rejet de l\'annonce', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+';

  const ListingCard = ({ listing }: { listing: PendingListing }) => {
    const mainImage = listing.images[0]?.data || PLACEHOLDER_IMAGE;

    return (
      <Card>
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 w-full sm:h-auto sm:w-48">
            <img
              src={mainImage}
              alt={listing.title}
              className="h-full w-full object-cover sm:rounded-l-lg"
            />
            <Badge className="absolute left-2 top-2">
              {listing.type === 'property' ? (
                <>
                  <Home className="mr-1 h-3 w-3" />
                  Immobilier
                </>
              ) : (
                <>
                  <Car className="mr-1 h-3 w-3" />
                  Véhicule
                </>
              )}
            </Badge>
          </div>
          <CardContent className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3 className="mb-1 font-semibold">{listing.title}</h3>
              <p className="mb-2 text-lg font-bold text-primary">
                {formatPrice(listing.price)}
              </p>
              <div className="mb-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {listing.city && (
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {listing.city}
                  </span>
                )}
                {listing.brand && (
                  <span>
                    {listing.brand} {listing.model}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Par <strong>{listing.user.name}</strong> ({listing.user.email})
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(listing)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-1 h-4 w-4" />
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedListing(listing);
                  setRejectDialogOpen(true);
                }}
                disabled={processing}
              >
                <X className="mr-1 h-4 w-4" />
                Rejeter
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={`/${listing.type === 'property' ? 'properties' : 'vehicles'}/${listing.id}`}
                  target="_blank"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Voir
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  const total = properties.length + vehicles.length;

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Modération des Annonces</h1>
        <p className="text-muted-foreground">
          {total} annonce{total > 1 ? 's' : ''} en attente de validation
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : total === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Aucune annonce en attente</h3>
            <p className="text-muted-foreground">
              Toutes les annonces ont été modérées
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Toutes ({total})</TabsTrigger>
            <TabsTrigger value="properties">
              Immobilier ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="vehicles">Véhicules ({vehicles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {[...properties, ...vehicles]
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
              .map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            {properties.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            {vehicles.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'annonce</DialogTitle>
            <DialogDescription>
              Expliquez la raison du rejet. L'utilisateur sera notifié.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du rejet (obligatoire)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className={!rejectReason.trim() && processing ? 'border-red-500' : ''}
          />
          {!rejectReason.trim() && (
            <p className="text-sm text-muted-foreground">
              Une raison est requise pour rejeter une annonce
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              Rejeter l'annonce
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
