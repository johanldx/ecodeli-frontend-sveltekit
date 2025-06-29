#!/usr/bin/env node

// Forcer les variables d'environnement
process.env.PORT = '3001';
process.env.HOST = '0.0.0.0';
process.env.NODE_ENV = 'production';

// Importer et démarrer l'application
import('./build/index.js'); 