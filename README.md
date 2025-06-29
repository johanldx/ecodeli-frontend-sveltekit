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

## 🚀 Développement

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

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

### Lancement en développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🏭 Production

### Prérequis

- Node.js 18+
- PM2 (gestionnaire de processus)
- Serveur Linux/Unix

### Installation de PM2

```bash
npm install -g pm2
```

### Configuration

1. **Variables d'environnement** : Créez un fichier `.env.production` avec vos variables de production
2. **Configuration PM2** : Modifiez `ecosystem.config.js` selon votre environnement

### Déploiement

#### Build et démarrage

```bash
# Build de l'application
npm run build

# Démarrage avec PM2
npm run pm2:start
```

#### Scripts PM2 disponibles

```bash
npm run pm2:start    # Démarrer l'application
npm run pm2:stop     # Arrêter l'application
npm run pm2:restart  # Redémarrer l'application
npm run pm2:reload   # Recharger l'application (zero-downtime)
npm run pm2:delete   # Supprimer l'application de PM2
npm run pm2:logs     # Voir les logs
npm run pm2:monit    # Monitorer l'application
```

#### Déploiement complet

```bash
npm run deploy:prod
```

### Configuration serveur

#### Nginx (recommandé)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Variables d'environnement

Créez un fichier `.env.production` :

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ECODELI_BASE_PATH=
# Ajoutez vos autres variables d'environnement
```

### Monitoring

- **PM2 Monitor** : `pm2 monit`
- **Logs** : `pm2 logs ecodeli-frontend`
- **Statut** : `pm2 status`

### Optimisations de production

- Compression gzip/brotli activée
- Polyfills pour compatibilité navigateurs
- Chunking automatique des bundles
- Minification avec Terser
- Mode cluster pour utilisation multi-cœurs

## 📁 Structure du projet

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

## 🔧 Scripts disponibles

- `npm run dev` - Développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm run start` - Démarrage en production
- `npm run pm2:start` - Démarrage avec PM2
- `npm run deploy:prod` - Déploiement complet

## 📝 Logs

Les logs sont stockés dans le dossier `logs/` :
- `combined.log` - Tous les logs
- `out.log` - Logs de sortie
- `error.log` - Logs d'erreur

## 🚨 Dépannage

### Problèmes courants

1. **Port déjà utilisé** : Changez le port dans `ecosystem.config.js`
2. **Permissions** : Assurez-vous que PM2 a les bonnes permissions
3. **Variables d'environnement** : Vérifiez votre fichier `.env.production`

### Commandes utiles

```bash
# Vérifier le statut PM2
pm2 status

# Redémarrer tous les processus
pm2 restart all

# Voir les logs en temps réel
pm2 logs --lines 100

# Sauvegarder la configuration PM2
pm2 save

# Restaurer la configuration PM2
pm2 resurrect
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
