'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Search,
  Home,
  Car,
  ArrowRight,
  Users,
  Building,
  Star,
  Shield,
  Clock,
  Phone,
  Check,
  User,
  Edit,
  Heart,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyCard } from '@/components/cards/property-card';
import { VehicleCard } from '@/components/cards/vehicle-card';
import { propertiesApi, vehiclesApi, searchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Données statiques
const stats = [
  { label: 'Utilisateurs actifs', value: '2,500+', icon: Users },
  { label: 'Biens vendus', value: '1,200+', icon: Building },
  { label: 'Avis positifs', value: '98%', icon: Star },
  { label: 'Années d\'expérience', value: '5+', icon: Clock },
];

const howItWorks = [
  {
    step: 1,
    title: 'Créez votre compte',
    description: 'Inscrivez-vous gratuitement en quelques clics et accédez à toutes les fonctionnalités.',
    icon: User,
  },
  {
    step: 2,
    title: 'Publiez votre annonce',
    description: 'Ajoutez vos photos, décrivez votre bien et fixez votre prix en toute simplicité.',
    icon: Edit,
  },
  {
    step: 3,
    title: 'Trouvez votre match',
    description: 'Recevez des demandes qualifiées et finalisez votre transaction en toute sécurité.',
    icon: Heart,
  },
];

const testimonials = [
  {
    name: 'Marie Dupont',
    role: 'Propriétaire',
    avatar: 'MD',
    rating: 5,
    content: 'J\'ai vendu mon appartement en moins de 3 semaines grâce à Immo-Auto. Le processus était simple et l\'équipe très réactive.',
  },
  {
    name: 'Thomas Martin',
    role: 'Acheteur',
    avatar: 'TM',
    rating: 5,
    content: 'Excellente plateforme ! J\'ai trouvé la voiture de mes rêves à un prix compétitif. Je recommande vivement.',
  },
  {
    name: 'Sophie Bernard',
    role: 'Investisseur',
    avatar: 'SB',
    rating: 5,
    content: 'Interface intuitive et annonces de qualité. J\'utilise Immo-Auto pour tous mes investissements immobiliers.',
  },
];

const trustBadges = [
  {
    title: 'Paiements sécurisés',
    description: 'Transactions protégées par cryptage SSL',
    icon: Shield,
  },
  {
    title: 'Support 7j/7',
    description: 'Une équipe à votre écoute en permanence',
    icon: Phone,
  },
  {
    title: 'Annonces vérifiées',
    description: 'Chaque annonce est contrôlée par nos équipes',
    icon: Check,
  },
];

const partners = [
  { name: 'BNP Paribas', logo: 'BNP' },
  { name: 'Crédit Agricole', logo: 'CA' },
  { name: 'AXA Assurance', logo: 'AXA' },
  { name: 'Société Générale', logo: 'SG' },
  { name: 'Allianz', logo: 'ALZ' },
  { name: 'MAIF', logo: 'MAIF' },
];

const faqs = [
  {
    question: 'Comment publier une annonce ?',
    answer: 'Créez un compte gratuit, cliquez sur "Déposer une annonce", remplissez le formulaire avec les détails de votre bien et ajoutez des photos. Votre annonce sera en ligne après validation.',
  },
  {
    question: 'Quels sont les frais de publication ?',
    answer: 'La publication d\'annonces est entièrement gratuite pour les particuliers. Des options de mise en avant payantes sont disponibles pour augmenter la visibilité de vos annonces.',
  },
  {
    question: 'Comment contacter un vendeur ?',
    answer: 'Sur chaque annonce, vous trouverez un bouton de contact. Connectez-vous à votre compte pour envoyer un message directement au vendeur ou appeler le numéro indiqué.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Oui, nous utilisons un cryptage SSL et respectons le RGPD. Vos données personnelles ne sont jamais partagées avec des tiers sans votre consentement.',
  },
  {
    question: 'Puis-je modifier ou supprimer mon annonce ?',
    answer: 'Oui, depuis votre tableau de bord, vous pouvez modifier, mettre en pause ou supprimer vos annonces à tout moment.',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'properties' | 'vehicles'>('properties');
  const [latestProperties, setLatestProperties] = useState<any[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    loadLatestListings();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const loadSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await searchApi.suggestions(searchQuery);
        const labels = response.data.map((s) => s.label);
        setSuggestions(labels);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadLatestListings = async () => {
    try {
      const [propertiesRes, vehiclesRes] = await Promise.all([
        propertiesApi.getAll({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
        vehiclesApi.getAll({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setLatestProperties(propertiesRes.data);
      setLatestVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/${searchType}?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] py-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        </div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Trouvez votre bien idéal
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Explorez des milliers d'annonces immobilières et de véhicules. Achetez, vendez ou
              louez en toute simplicité.
            </p>

            {/* Search Box */}
            <Card className="p-6">
              <Tabs
                defaultValue="properties"
                onValueChange={(v) => setSearchType(v as 'properties' | 'vehicles')}
              >
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="properties" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Immobilier
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Véhicules
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Autocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSelect={handleSearch}
                        suggestions={suggestions}
                        placeholder="Ville, type de bien, mots-clés..."
                        isLoading={isLoadingSuggestions}
                      />
                    </div>
                    <Button onClick={handleSearch}>
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="vehicles">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Autocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSelect={handleSearch}
                        suggestions={suggestions}
                        placeholder="Marque, modèle, mots-clés..."
                        isLoading={isLoadingSuggestions}
                      />
                    </div>
                    <Button onClick={handleSearch}>
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Comment ça marche ?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Trois étapes simples pour vendre, acheter ou louer votre bien
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div className="mb-4 flex justify-center">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {item.step < 3 && (
                  <div className="absolute right-0 top-8 hidden w-1/3 border-t-2 border-dashed border-primary/30 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/properties?listingType=SALE">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Acheter un bien</h3>
                    <p className="text-sm text-muted-foreground">Immobilier à vendre</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?listingType=RENT">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Louer un bien</h3>
                    <p className="text-sm text-muted-foreground">Immobilier à louer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/vehicles?listingType=SALE">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Acheter un véhicule</h3>
                    <p className="text-sm text-muted-foreground">Véhicules à vendre</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/vehicles?listingType=RENT">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Louer un véhicule</h3>
                    <p className="text-sm text-muted-foreground">Véhicules à louer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dernières annonces immobilières</h2>
              <p className="text-muted-foreground">
                Découvrez les derniers biens ajoutés sur notre plateforme
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/properties">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-3 h-4 w-1/2 rounded bg-muted" />
                    <div className="h-6 w-1/3 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Vehicles */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dernières annonces véhicules</h2>
              <p className="text-muted-foreground">
                Trouvez le véhicule parfait parmi nos dernières annonces
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/vehicles">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4">
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-3 h-4 w-1/2 rounded bg-muted" />
                    <div className="h-6 w-1/3 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {latestVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ce que disent nos clients</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Des milliers de clients satisfaits nous font confiance
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <MessageCircle className="absolute right-6 top-6 h-8 w-8 text-primary/10" />
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-start gap-4 text-center md:text-left">
                <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 md:mx-0">
                  <badge.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Nos partenaires de confiance</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Ils nous accompagnent pour vous offrir le meilleur service
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex h-16 w-32 items-center justify-center rounded-lg border bg-background p-4 grayscale transition-all hover:grayscale-0"
              >
                <span className="text-xl font-bold text-muted-foreground">{partner.logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Questions fréquentes</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  className="flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-muted-foreground transition-transform',
                      openFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <div className="border-t px-6 pb-6 pt-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="mb-4 text-3xl font-bold">Vendez ou louez votre bien</h2>
            <p className="mb-8 text-lg opacity-90">
              Déposez votre annonce gratuitement et trouvez rapidement des acheteurs ou locataires
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/listings/new">Déposer une annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
