# Ecodeli Frontend - Application SvelteKit

<p align="center">
  <img src="static/images/logo/ecodeli-logo.png" width="200" alt="Ecodeli Logo" />
</p>

## Description

Interface utilisateur web pour la plateforme Ecodeli, une application de livraison écologique et de services personnalisés. Cette application est construite avec [SvelteKit](https://kit.svelte.dev/) et offre une expérience utilisateur moderne et responsive.

## Fonctionnalités principales

- 🏠 **Page d'accueil** - Présentation de la plateforme et services
- 🔐 **Authentification** - Connexion/inscription sécurisée
- 👤 **Espace utilisateur** - Gestion du profil et des commandes
- 🚚 **Suivi de livraison** - Suivi en temps réel des commandes
- 💬 **Messagerie** - Communication avec les livreurs et fournisseurs
- 📱 **Interface responsive** - Optimisée pour mobile et desktop
- 🌍 **Internationalisation** - Support multi-langues avec Inlang
- 🎨 **Design moderne** - Interface utilisateur avec Tailwind CSS et DaisyUI
- 📊 **Tableau de bord** - Statistiques et gestion des commandes
- ⭐ **Système de notation** - Évaluation des services

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Backend Ecodeli en cours d'exécution

## Installation

```bash
# Cloner le repository
git clone <repository-url>
cd ecodeli-frontend-sveltekit

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans .env
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# API Backend
PUBLIC_API_URL=http://localhost:3000
PUBLIC_WS_URL=ws://localhost:3000

# Application
PUBLIC_APP_NAME=Ecodeli
PUBLIC_APP_VERSION=1.0.0

# Fonctionnalités
PUBLIC_ENABLE_ANALYTICS=false
PUBLIC_ENABLE_DEBUG=false
```

## Démarrage

```bash
# Mode développement
npm run dev

# Mode développement avec ouverture automatique du navigateur
npm run dev -- --open

# Mode production
npm run build
npm run preview
```

## Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run preview` - Prévisualiser la version de production
- `npm run check` - Vérifier les types TypeScript
- `npm run check:watch` - Vérifier les types en mode watch
- `npm run format` - Formater le code avec Prettier
- `npm run lint` - Linter le code
- `npm run machine-translate` - Traduire automatiquement les textes

## Structure du projet

```
src/
├── app.html              # Template HTML principal
├── app.css               # Styles globaux
├── app.d.ts              # Types globaux
├── lib/
│   ├── components/       # Composants réutilisables
│   │   ├── ui/          # Composants d'interface
│   │   ├── forms/       # Composants de formulaires
│   │   └── layout/      # Composants de mise en page
│   ├── stores/          # Stores Svelte (état global)
│   ├── types/           # Types TypeScript
│   └── utils/           # Utilitaires et helpers
├── routes/
│   ├── +layout.svelte   # Layout principal
│   ├── +page.svelte     # Page d'accueil
│   ├── auth/            # Pages d'authentification
│   ├── app/             # Pages de l'application
│   ├── admin/           # Pages d'administration
│   ├── track/           # Suivi de commandes
│   ├── rate/            # Système de notation
│   └── legal/           # Pages légales
└── static/
    └── images/          # Images et assets
```

## Technologies utilisées

- **SvelteKit** - Framework web moderne
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **DaisyUI** - Composants UI pour Tailwind
- **Socket.IO** - Communication en temps réel
- **Monaco Editor** - Éditeur de code intégré
- **FullCalendar** - Composant de calendrier
- **Inlang** - Internationalisation
- **JWT Decode** - Gestion des tokens JWT

## Déploiement

### Avec Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Avec Netlify

```bash
# Construire l'application
npm run build

# Déployer le dossier build/
```

### Avec Docker

```bash
# Construire l'image
docker build -t ecodeli-frontend .

# Lancer le conteneur
docker run -p 4173:4173 ecodeli-frontend
```

## Internationalisation

L'application utilise Inlang pour la gestion des traductions :

```bash
# Ajouter une nouvelle langue
npm run machine-translate

# Les fichiers de traduction se trouvent dans :
# - src/lib/i18n/
```

## Développement

### Ajouter un nouveau composant

1. Créer le fichier dans `src/lib/components/`
2. Exporter le composant depuis `src/lib/components/index.ts`
3. Importer et utiliser dans les pages

### Ajouter une nouvelle page

1. Créer le fichier dans `src/routes/`
2. Suivre la convention de nommage SvelteKit
3. Ajouter la navigation si nécessaire

### Styles

- Utiliser Tailwind CSS pour les styles
- Créer des classes personnalisées dans `src/app.css` si nécessaire
- Utiliser DaisyUI pour les composants UI

## Tests

```bash
# Lancer les tests (à implémenter)
npm run test

# Tests en mode watch
npm run test:watch
```

## Performance

- Lazy loading des composants
- Optimisation des images
- Code splitting automatique avec SvelteKit
- Préchargement des routes importantes

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement Ecodeli.

## Licence

Ce projet est privé et propriétaire d'Ecodeli.
