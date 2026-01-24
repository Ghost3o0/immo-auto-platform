'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Car,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminApi, AdminListing } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadListings();
  }, [page, typeFilter, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (search !== undefined) {
        setPage(1);
        loadListings();
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getListings({
        search: search || undefined,
        type: typeFilter as 'property' | 'vehicle' | undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setListings(response.data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPage(1);
    loadListings();
  }, [search, typeFilter, statusFilter]);

  const handleStatusChange = async (
    listing: AdminListing,
    status: string
  ) => {
    try {
      await adminApi.updateListingStatus(listing.type, listing.id, status);
      loadListings();
    } catch (error) {
      console.error('Error updating listing status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    try {
      await adminApi.deleteListing(selectedListing.type, selectedListing.id);
      setDeleteDialogOpen(false);
      setSelectedListing(null);
      loadListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'SOLD':
        return <Badge className="bg-blue-500">Vendu</Badge>;
      case 'RENTED':
        return <Badge className="bg-purple-500">Loué</Badge>;
      case 'INACTIVE':
        return <Badge variant="destructive">Inactif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des Annonces</h1>
        <p className="text-muted-foreground">
          Gérez toutes les annonces de la plateforme
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Rechercher par titre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-xs"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="property">Immobilier</SelectItem>
                <SelectItem value="vehicle">Véhicule</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="SOLD">Vendu</SelectItem>
                <SelectItem value="RENTED">Loué</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des annonces</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucune annonce trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Annonce</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Prix</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Propriétaire</th>
                    <th className="pb-3 font-medium">Signalements</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {listing.images[0] && (
                            <img
                              src={listing.images[0].data}
                              alt={listing.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">
                              {listing.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">
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
                      </td>
                      <td className="py-4 font-medium">
                        {formatPrice(listing.price)}
                      </td>
                      <td className="py-4">{getStatusBadge(listing.status)}</td>
                      <td className="py-4">
                        <div>
                          <p className="text-sm">{listing.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {listing.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        {listing.reportsCount > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {listing.reportsCount}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/${listing.type === 'property' ? 'properties' : 'vehicles'}/${listing.id}`}
                                target="_blank"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir l'annonce
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {listing.status !== 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(listing, 'ACTIVE')
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Activer
                              </DropdownMenuItem>
                            )}
                            {listing.status !== 'INACTIVE' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(listing, 'INACTIVE')
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                                Désactiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedListing(listing);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'annonce ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'annonce{' '}
              <strong>"{selectedListing?.title}"</strong> sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
