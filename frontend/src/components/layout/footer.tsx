import Link from 'next/link';
import { Home, Car, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IA</span>
              </div>
              <span className="font-bold">Immo-Auto</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Votre plateforme de référence pour la vente et la location d'immobilier et de
              véhicules.
            </p>
          </div>

          {/* Immobilier */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 font-semibold">
              <Home className="h-4 w-4" />
              <span>Immobilier</span>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/properties?listingType=SALE" className="hover:text-primary">
                  Acheter
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=RENT" className="hover:text-primary">
                  Louer
                </Link>
              </li>
              <li>
                <Link href="/listings/new" className="hover:text-primary">
                  Vendre
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-primary">
                  Toutes les annonces
                </Link>
              </li>
            </ul>
          </div>

          {/* Véhicules */}
          <div className="space-y-4">
            <h3 className="flex items-center space-x-2 font-semibold">
              <Car className="h-4 w-4" />
              <span>Véhicules</span>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/vehicles?listingType=SALE" className="hover:text-primary">
                  Acheter
                </Link>
              </li>
              <li>
                <Link href="/vehicles?listingType=RENT" className="hover:text-primary">
                  Louer
                </Link>
              </li>
              <li>
                <Link href="/listings/new" className="hover:text-primary">
                  Vendre
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="hover:text-primary">
                  Toutes les annonces
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@immo-auto.fr</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>01 23 45 67 89</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Immo-Auto. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
