'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Home,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Phone,
  Mail,
  User,
  MessageCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { propertiesApi, favoritesApi, messagesApi } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice, formatSurface, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

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

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProperty(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (property && isAuthenticated) {
      checkFavorite();
    }
  }, [property, isAuthenticated]);

  const loadProperty = async (id: string) => {
    try {
      const response = await propertiesApi.getOne(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error loading property:', error);
      router.push('/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesApi.check({ propertyId: property.id });
      setIsFavorite(response.data.isFavorite);
      setFavoriteId(response.data.favoriteId || null);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await favoritesApi.remove(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const response = await favoritesApi.add({ propertyId: property.id });
        setIsFavorite(true);
        setFavoriteId(response.data.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!contactMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      const response = await messagesApi.createConversation({
        sellerId: property.user.id,
        propertyId: property.id,
        message: contactMessage,
      });
      setContactDialogOpen(false);
      setContactMessage('');
      router.push(`/dashboard/messages?conversation=${response.data.id}`);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-muted" />
          <div className="mb-8 aspect-video rounded-lg bg-muted" />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <div className="h-10 w-3/4 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Annonce non trouvée</h1>
          <p className="mt-2 text-muted-foreground">
            Cette annonce n'existe pas ou a été supprimée.
          </p>
          <Button className="mt-4" onClick={() => router.push('/properties')}>
            Retour aux annonces
          </Button>
        </div>
      </div>
    );
  }

  const isRent = property.listingType === 'RENT';
  const images = property.images || [];

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]?.data}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Aucune image
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_: any, index: number) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {images.map((image: any, index: number) => (
              <button
                key={image.id}
                className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-md ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={image.data} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant={isRent ? 'secondary' : 'default'}>
                {isRent ? 'Location' : 'Vente'}
              </Badge>
              <Badge variant="outline">
                {propertyTypeLabels[property.type] || property.type}
              </Badge>
            </div>
            <h1 className="mb-2 text-3xl font-bold">{property.title}</h1>
            <p className="flex items-center text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {property.address}, {property.zipCode} {property.city}
            </p>
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatPrice(property.price, isRent)}
          </div>

          {/* Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Surface</p>
                    <p className="font-semibold">{formatSurface(property.surface)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pièces</p>
                    <p className="font-semibold">{property.rooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chambres</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salles de bain</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{property.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Équipements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: string) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                <div className="text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-12 w-12" />
                  <p>
                    {property.address}, {property.zipCode} {property.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleFavorite}>
                  <Heart
                    className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                  />
                  {isFavorite ? 'Retirer' : 'Favoris'}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contacter le vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              {property.user && (
                <div className="mb-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {property.user.avatar ? (
                      <AvatarImage src={property.user.avatar} alt={property.user.name} />
                    ) : null}
                    <AvatarFallback>
                      {property.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{property.user.name}</p>
                    <Link
                      href={`/users/${property.user.id}`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Envoyer un message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contacter {property.user?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">{property.title}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(property.price, isRent)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Une nouvelle conversation sera créée avec le vendeur. Vous pourrez suivre vos échanges depuis votre messagerie.
                      </p>
                      <Textarea
                        placeholder="Bonjour, je suis intéressé par votre annonce..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        rows={4}
                      />
                      <Button
                        className="w-full"
                        onClick={handleSendMessage}
                        disabled={!contactMessage.trim() || isSendingMessage}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {isSendingMessage ? 'Envoi...' : 'Démarrer la conversation'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {property.user?.phone && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${property.user.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {property.user.phone}
                    </a>
                  </Button>
                )}
                {property.user?.email && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${property.user.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer un email
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Publiée le {formatDate(property.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
