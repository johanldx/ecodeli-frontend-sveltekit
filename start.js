#!/usr/bin/env node

// Variables d'environnement
process.env.PORT = '3001';
process.env.HOST = '0.0.0.0';
process.env.NODE_ENV = 'production';

import('./server.js');
