# Backend - Immo-Auto API

API REST NestJS pour la plateforme Immo-Auto.

## Stack

- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + Passport
- Swagger

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/immo_auto_db?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Base de données

```bash
# Créer les tables
npx prisma migrate dev

# Générer le client
npx prisma generate

# Seed des données de test
npx prisma db seed

# Interface Prisma Studio
npx prisma studio
```

## Lancement

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Documentation API

Swagger disponible à : `http://localhost:3001/api/docs`

## Structure

```
src/
├── main.ts              # Point d'entrée
├── app.module.ts        # Module racine
├── modules/
│   ├── auth/           # Authentification JWT
│   ├── users/          # Gestion utilisateurs
│   ├── properties/     # CRUD propriétés
│   ├── vehicles/       # CRUD véhicules
│   ├── favorites/      # Gestion favoris
│   ├── upload/         # Upload images
│   └── search/         # Recherche globale
├── common/
│   ├── guards/         # JWT Guard, Roles Guard
│   ├── decorators/     # @Public, @Roles, @CurrentUser
│   └── filters/        # Exception filters
└── database/
    ├── prisma.module.ts
    └── prisma.service.ts
```

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/logout | Déconnexion |
| POST | /api/auth/refresh-token | Rafraîchir token |
| GET | /api/auth/me | Profil connecté |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/:id | Récupérer un utilisateur |
| PUT | /api/users/:id | Modifier profil |
| DELETE | /api/users/:id | Supprimer compte |
| GET | /api/users/:id/listings | Annonces d'un utilisateur |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/properties | Liste avec filtres |
| GET | /api/properties/:id | Détail |
| POST | /api/properties | Créer (auth) |
| PUT | /api/properties/:id | Modifier (auth) |
| DELETE | /api/properties/:id | Supprimer (auth) |
| PATCH | /api/properties/:id/status | Changer statut (auth) |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | Liste avec filtres |
| GET | /api/vehicles/:id | Détail |
| POST | /api/vehicles | Créer (auth) |
| PUT | /api/vehicles/:id | Modifier (auth) |
| DELETE | /api/vehicles/:id | Supprimer (auth) |
| PATCH | /api/vehicles/:id/status | Changer statut (auth) |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/favorites | Liste des favoris (auth) |
| POST | /api/favorites | Ajouter (auth) |
| DELETE | /api/favorites/:id | Retirer (auth) |
| GET | /api/favorites/check | Vérifier si favori (auth) |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search | Recherche globale |
| GET | /api/search/suggestions | Autocomplete |

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```
