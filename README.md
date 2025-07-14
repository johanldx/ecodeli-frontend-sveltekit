# Ecodeli Frontend - Application SvelteKit

<p align="center">
  <img src="static/images/logo/ecodeli-logo.png" width="200" alt="Ecodeli Logo" />
</p>

## Présentation du projet

**Ecodeli** est une plateforme web dédiée à la livraison écologique et aux services personnalisés. L’application propose une expérience moderne, fluide et responsive, permettant aux utilisateurs de commander, suivre leurs livraisons, communiquer avec les livreurs et gérer leurs services depuis une interface intuitive.

Ce dépôt contient le code source du frontend, développé avec **SvelteKit**, et s’intègre à un backend NestJS et une application mobile Kotlin.

---

## Fonctionnalités principales

- **Accueil** : Présentation de la plateforme et de ses valeurs écologiques.
- **Authentification** : Inscription, connexion sécurisée, gestion des sessions.
- **Espace utilisateur** : Gestion du profil, des commandes et des préférences.
- **Suivi de livraison** : Visualisation en temps réel de l’état des commandes.
- **Messagerie** : Chat intégré entre clients, livreurs et fournisseurs.
- **Tableau de bord** : Statistiques, historique et gestion avancée.
- **Notation** : Système d’évaluation des services et des intervenants.
- **Internationalisation** : Interface multilingue (Inlang).
- **Design moderne** : UI basée sur Tailwind CSS et DaisyUI.

---

## Structure du code

Le projet est organisé pour favoriser la clarté, la réutilisabilité et la scalabilité :

```
src/
├── app.html              # Template HTML principal
├── app.css               # Styles globaux (Tailwind, DaisyUI)
├── app.d.ts              # Types globaux
├── lib/
│   ├── components/       # Composants UI réutilisables (boutons, formulaires, layouts, etc.)
│   ├── stores/           # Stores Svelte pour la gestion d’état global (auth, user, notifications…)
│   ├── types/            # Définition des types TypeScript partagés
│   └── utils/            # Fonctions utilitaires (API, helpers, formatteurs…)
├── routes/
│   ├── +layout.svelte    # Layout principal de l’application
│   ├── +page.svelte      # Page d’accueil
│   ├── auth/             # Pages d’authentification (login, register, reset…)
│   ├── app/              # Pages principales de l’application (profil, commandes…)
│   ├── admin/            # Pages d’administration
│   ├── track/            # Suivi de commandes
│   ├── rate/             # Système de notation
│   └── legal/            # Pages légales (CGU, politique de confidentialité…)
└── static/
    └── images/           # Images et assets statiques
```

---

## Technologies principales

- **SvelteKit** : Framework web moderne, SSR et SPA.
- **TypeScript** : Sécurité et robustesse du typage.
- **Tailwind CSS & DaisyUI** : Design rapide et cohérent.
- **Socket.IO** : Communication temps réel (messagerie, notifications).
- **Inlang** : Gestion multilingue.
- **Monaco Editor, FullCalendar** : Composants avancés pour l’édition et la gestion de calendrier.

---

## Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation & lancement

```bash
git clone <repository-url>
cd ecodeli-frontend-sveltekit
npm install
cp .env.example .env
# Configurer les variables d’environnement dans .env
npm run dev
```

L’application sera accessible sur [http://localhost:5173](http://localhost:5173).

---

## Déploiement & production

- Build : `npm run build`
- Démarrage : `npm run start` ou via PM2 (`npm run pm2:start`)
- Configuration serveur recommandée : Nginx en reverse proxy
- Variables d’environnement à adapter dans `.env.production`

---

## Configuration et utilisation de PM2 (SSR)

Pour un déploiement en mode SSR (Server Side Rendering), il est recommandé d’utiliser **PM2** pour gérer le processus Node.js en production.

### Installation de PM2

```bash
npm install -g pm2
```

### Configuration de l’environnement

- Créez un fichier `.env.production` à la racine du projet avec vos variables d’environnement (voir `.env.example`).
- Vérifiez ou adaptez le port et l’hôte selon vos besoins (ex : `PORT=3000`, `HOST=0.0.0.0`).

### Build et lancement avec PM2

```bash
npm run build
npm run pm2:start
```

### Scripts PM2 disponibles

- `npm run pm2:start`    : Démarrer l’application en mode production SSR
- `npm run pm2:stop`     : Arrêter l’application
- `npm run pm2:restart`  : Redémarrer l’application
- `npm run pm2:reload`   : Recharger l’application (zero-downtime)
- `npm run pm2:delete`   : Supprimer l’application de PM2
- `npm run pm2:logs`     : Voir les logs
- `npm run pm2:monit`    : Monitorer l’application

### Exemple de configuration Nginx (reverse proxy)

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

### Monitoring et logs

- **PM2 Monitor** : `pm2 monit`
- **Logs** : `pm2 logs ecodeli-frontend`
- **Statut** : `pm2 status`

---

## Tests & qualité

- Les tests sont à implémenter (`npm run test`)
- Optimisations : lazy loading, code splitting, préchargement des routes, optimisation des images

---

## Support & contact

Pour toute question ou contribution, merci de contacter l’équipe de développement Ecodeli.

---

## Licence

Projet privé et propriétaire d’Ecodeli.
