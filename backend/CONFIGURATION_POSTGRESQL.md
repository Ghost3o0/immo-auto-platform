# Configuration PostgreSQL pour Immo-Auto Platform

Ce guide vous explique comment configurer PostgreSQL pour ce projet.

## 1. Installation de PostgreSQL

Si PostgreSQL n'est pas encore installé sur votre système Windows :

### Option A : Installer via l'installateur Windows
1. Téléchargez PostgreSQL depuis : https://www.postgresql.org/download/windows/
2. Exécutez l'installateur et suivez les instructions
3. **Important** : Notez le mot de passe du superutilisateur `postgres` que vous définirez
4. Par défaut, PostgreSQL s'installe sur le port `5432`

### Option B : Installer via Chocolatey (si installé)
```powershell
choco install postgresql
```

## 2. Créer la base de données

Une fois PostgreSQL installé, vous devez créer la base de données `immo_auto_db`.

### Méthode 1 : Via pgAdmin (Interface graphique)
1. Ouvrez pgAdmin (installé avec PostgreSQL)
2. Connectez-vous au serveur PostgreSQL
3. Clic droit sur "Databases" → "Create" → "Database"
4. Nommez la base : `immo_auto_db`
5. Cliquez sur "Save"

### Méthode 2 : Via ligne de commande SQL
Si PostgreSQL est dans votre PATH, ouvrez PowerShell et exécutez :

```powershell
# Se connecter à PostgreSQL (remplacez 'password' par votre mot de passe)
psql -U postgres

# Dans l'invite psql, exécutez :
CREATE DATABASE immo_auto_db;
\q
```

### Méthode 3 : Via Prisma (recommandé)
Prisma peut créer automatiquement la base de données si vous utilisez la bonne URL :

Dans `backend/.env`, assurez-vous que `DATABASE_URL` pointe vers la base `postgres` (base par défaut) :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/postgres?schema=public"
```

Puis utilisez Prisma pour créer la base de données :

```bash
cd backend
npx prisma migrate dev --name init
```

Prisma créera automatiquement la base `immo_auto_db` si elle n'existe pas.

## 3. Configurer le fichier .env

Éditez `backend/.env` et mettez à jour `DATABASE_URL` avec vos identifiants PostgreSQL :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/immo_auto_db?schema=public"
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` : Le mot de passe PostgreSQL que vous avez défini
- `localhost` : L'adresse de votre serveur PostgreSQL (localhost par défaut)
- `5432` : Le port PostgreSQL (5432 par défaut)
- `immo_auto_db` : Le nom de la base de données

## 4. Générer les migrations Prisma

Une fois la base de données créée et le `.env` configuré :

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma migrate dev --name init

# Optionnel : Charger des données de test
npm run prisma:seed
```

## 5. Vérifier la connexion

Vous pouvez vérifier que tout fonctionne :

```bash
# Lancer Prisma Studio (interface graphique pour voir les données)
npx prisma studio
```

Ouvrez http://localhost:5555 dans votre navigateur.

## 6. Scripts utiles

Depuis la racine du projet ou depuis `backend/` :

```bash
# Générer le client Prisma
pnpm prisma:generate
# ou
npm run prisma:generate

# Exécuter les migrations
pnpm prisma:migrate
# ou
npm run prisma:migrate

# Charger des données de test
pnpm prisma:seed
# ou
npm run prisma:seed

# Ouvrir Prisma Studio
pnpm prisma:studio
# ou
npm run prisma:studio
```

## Dépannage

### Erreur : "psql n'est pas reconnu"
PostgreSQL n'est pas dans votre PATH. Solutions :
- Ajoutez le chemin de PostgreSQL au PATH Windows (ex: `C:\Program Files\PostgreSQL\16\bin`)
- Ou utilisez pgAdmin au lieu de la ligne de commande

### Erreur : "password authentication failed"
Vérifiez que le mot de passe dans `DATABASE_URL` correspond au mot de passe PostgreSQL.

### Erreur : "database does not exist"
La base de données n'existe pas. Créez-la manuellement ou laissez Prisma la créer.

### Erreur de connexion
Vérifiez que le service PostgreSQL est démarré :
- Ouvrez "Services" dans Windows (Win+R, tapez `services.msc`)
- Cherchez "postgresql-x64-XX" et vérifiez qu'il est "En cours d'exécution"

## Structure de la base de données

Après les migrations, votre base de données contiendra :

- `users` : Utilisateurs de la plateforme
- `properties` : Annonces immobilières
- `vehicles` : Annonces de véhicules
- `images` : Images associées aux annonces
- `favorites` : Favoris des utilisateurs
- `_prisma_migrations` : Historique des migrations

## Comptes de test (après seed)

- **User** : `user@example.com` / `Password123!`
- **Admin** : `admin@example.com` / `Password123!`
