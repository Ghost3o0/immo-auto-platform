# Immo-Auto Platform

Plateforme complète de vente et location d'immobilier et de véhicules.

## Architecture

Ce projet est un monorepo contenant :

```
immo-auto-platform/
├── frontend/          # Application Next.js 14
├── backend/           # API NestJS
├── shared/            # Types TypeScript partagés
├── package.json       # Scripts root
└── turbo.json         # Configuration Turborepo
```

## Stack Technologique

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI (composants)
- React Hook Form + Zod (validation)

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication (Passport)

## Prérequis

- Node.js >= 18.0.0
- PostgreSQL
- npm ou yarn

## Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd immo-auto-platform
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Copier les fichiers d'environnement :

```bash
# Backend
cp backend/.env.example backend/.env
```

Éditer `backend/.env` avec vos paramètres :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète pour les tokens JWT

### 4. Configurer la base de données

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Lancer le projet

En mode développement (frontend + backend) :

```bash
npm run dev
```

Ou séparément :

```bash
# Backend (port 3001)
npm run dev:backend

# Frontend (port 3000)
npm run dev:frontend
```

## Comptes de test

Après le seed de la base de données :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| user@example.com | Password123! | USER |
| admin@example.com | Password123! | ADMIN |

## Fonctionnalités

### Utilisateurs
- Inscription / Connexion (JWT)
- Gestion du profil avec avatar
- Changement de mot de passe sécurisé
- Préférences de notifications
- Suppression de compte
- Authentification JWT

### Immobilier
- Liste des propriétés avec filtres (ville, prix, surface, type)
- Détail d'une propriété avec galerie d'images
- Création / modification / suppression d'annonces
- Gestion des statuts (Brouillon, Active, Vendu, Loué, Inactive)
- Upload d'images (max 10)
- Pagination

### Véhicules
- Liste des véhicules avec filtres (marque, prix, année, kilométrage)
- Détail d'un véhicule avec galerie d'images
- Création / modification / suppression d'annonces
- Gestion des statuts (Brouillon, Active, Vendu, Loué, Inactive)
- Upload d'images (max 10)
- Pagination

### Messagerie
- Conversations entre acheteurs et vendeurs
- Contact direct depuis les annonces
- Compteur de messages non lus
- Historique des conversations

### Favoris
- Ajouter / retirer des favoris
- Consulter ses favoris par catégorie

### Dashboard
- Statistiques de vues (graphiques Chart.js)
- Statistiques d'activité
- Gestion des annonces
- Messages
- Favoris

### Recherche
- Recherche globale
- Suggestions autocomplete
- Filtres combinés

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

### Properties
- `GET /api/properties` - Liste (avec filtres et pagination)
- `GET /api/properties/:id` - Détail
- `POST /api/properties` - Créer (auth)
- `PUT /api/properties/:id` - Modifier (auth)
- `DELETE /api/properties/:id` - Supprimer (auth)

### Vehicles
- `GET /api/vehicles` - Liste (avec filtres et pagination)
- `GET /api/vehicles/:id` - Détail
- `POST /api/vehicles` - Créer (auth)
- `PUT /api/vehicles/:id` - Modifier (auth)
- `DELETE /api/vehicles/:id` - Supprimer (auth)

### Favorites
- `GET /api/favorites` - Liste des favoris (auth)
- `POST /api/favorites` - Ajouter un favori (auth)
- `DELETE /api/favorites/:id` - Retirer un favori (auth)

### Search
- `GET /api/search` - Recherche globale
- `GET /api/search/suggestions` - Suggestions autocomplete

### Messages
- `GET /api/messages/conversations` - Liste des conversations (auth)
- `GET /api/messages/conversations/:id` - Détail d'une conversation (auth)
- `POST /api/messages/conversations` - Créer une conversation (auth)
- `POST /api/messages/conversations/:id/messages` - Envoyer un message (auth)
- `GET /api/messages/unread-count` - Compteur de messages non lus (auth)

### Analytics
- `GET /api/analytics/views` - Statistiques de vues (auth)
- `GET /api/analytics/activity` - Statistiques d'activité (auth)

### Users
- `GET /api/users/:id` - Détail utilisateur
- `PATCH /api/users/:id` - Modifier profil (auth)
- `DELETE /api/users/:id` - Supprimer compte (auth)
- `PATCH /api/users/:id/password` - Changer mot de passe (auth)
- `GET /api/users/:id/listings` - Annonces de l'utilisateur
- `GET /api/users/:id/notification-preferences` - Préférences notifications (auth)
- `PATCH /api/users/:id/notification-preferences` - Modifier préférences (auth)

## Documentation API

Swagger UI disponible à : `http://localhost:3001/api/docs`

## Scripts disponibles

```bash
# Développement
npm run dev              # Lance frontend + backend
npm run dev:frontend     # Lance seulement le frontend
npm run dev:backend      # Lance seulement le backend

# Build
npm run build            # Build tous les packages

# Prisma
npm run prisma:migrate   # Exécute les migrations
npm run prisma:generate  # Génère le client Prisma
npm run prisma:seed      # Seed la base de données
npm run prisma:studio    # Lance Prisma Studio

# Lint
npm run lint             # Lint tous les packages
```

## Structure des dossiers

### Frontend (`/frontend`)
```
src/
├── app/                 # Pages Next.js (App Router)
│   ├── auth/           # Pages d'authentification
│   ├── dashboard/      # Dashboard utilisateur
│   ├── properties/     # Annonces immobilières
│   ├── vehicles/       # Annonces véhicules
│   └── listings/       # Gestion des annonces
├── components/          # Composants React
│   ├── ui/             # Composants UI de base (Shadcn)
│   ├── layout/         # Header, Footer
│   ├── cards/          # Cards (Property, Vehicle)
│   ├── charts/         # Graphiques (Chart.js)
│   └── forms/          # Formulaires
├── contexts/           # Contextes React (Auth)
├── hooks/              # Hooks personnalisés
├── lib/                # Utilitaires (api, utils)
└── types/              # Types TypeScript
```

### Backend (`/backend`)
```
src/
├── modules/            # Modules NestJS
│   ├── auth/          # Authentification
│   ├── users/         # Utilisateurs
│   ├── properties/    # Propriétés
│   ├── vehicles/      # Véhicules
│   ├── favorites/     # Favoris
│   ├── messages/      # Messagerie
│   ├── analytics/     # Statistiques
│   ├── upload/        # Upload d'images
│   └── search/        # Recherche
├── common/            # Guards, Decorators, Filters
├── config/            # Configuration
└── database/          # Service Prisma
prisma/
├── schema.prisma      # Schéma de base de données
└── seed.ts            # Données de test
```

## Licence

MIT
