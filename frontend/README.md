# Frontend - Immo-Auto

Application web Next.js 14 pour la plateforme Immo-Auto.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form + Zod
- Lucide Icons

## Installation

```bash
npm install
```

## Lancement

```bash
# Développement
npm run dev

# Production
npm run build
npm run start
```

L'application sera disponible à : `http://localhost:3000`

## Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── (auth)/            # Pages auth (login, register)
│   ├── properties/        # Liste et détail propriétés
│   ├── vehicles/          # Liste et détail véhicules
│   ├── dashboard/         # Espace utilisateur
│   │   ├── listings/     # Mes annonces
│   │   ├── favorites/    # Mes favoris
│   │   └── profile/      # Mon profil
│   └── listings/          # Création/édition annonces
├── components/
│   ├── ui/               # Composants de base (Button, Input, Card...)
│   ├── layout/           # Header, Footer
│   ├── cards/            # PropertyCard, VehicleCard
│   └── forms/            # Formulaires
├── contexts/
│   └── auth-context.tsx  # Contexte authentification
├── hooks/                # Hooks personnalisés
├── lib/
│   ├── api.ts           # Client API
│   └── utils.ts         # Utilitaires
└── types/               # Types TypeScript
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/properties` | Liste des propriétés |
| `/properties/[id]` | Détail propriété |
| `/vehicles` | Liste des véhicules |
| `/vehicles/[id]` | Détail véhicule |
| `/login` | Connexion |
| `/register` | Inscription |
| `/dashboard` | Tableau de bord |
| `/dashboard/listings` | Mes annonces |
| `/dashboard/favorites` | Mes favoris |
| `/dashboard/profile` | Mon profil |
| `/listings/new` | Créer une annonce |

## Composants UI

Les composants UI sont basés sur Shadcn UI :

- Button
- Input
- Label
- Card
- Badge
- Dialog
- Select
- Tabs
- Avatar
- Dropdown Menu

## Fonctionnalités

### Recherche et filtres
- Recherche textuelle
- Filtres par type, prix, surface, etc.
- Pagination

### Authentification
- Inscription / Connexion
- Tokens JWT stockés en localStorage
- Rafraîchissement automatique

### Annonces
- Création d'annonces immobilières et véhicules
- Upload d'images (drag & drop)
- Modification / suppression

### Favoris
- Ajout / retrait en un clic
- Liste des favoris dans le dashboard

### Design
- Responsive (mobile-first)
- Dark mode
- Animations fluides

## Configuration

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Build

```bash
npm run build
```

Les fichiers de build seront dans `.next/`
