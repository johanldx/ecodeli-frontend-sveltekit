module.exports = {
  apps: [
    {
      name: 'ecodeli-frontend',
      script: 'build/index.js',
      instances: 'max', // Utilise tous les cœurs CPU disponibles
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configuration pour le redémarrage automatique
      watch: false,
      max_memory_restart: '1G',
      // Logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Gestion des erreurs
      max_restarts: 10,
      min_uptime: '10s',
      // Variables d'environnement spécifiques à la production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ],

  // Configuration pour le déploiement
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ecodeli-frontend-sveltekit.git',
      path: '/var/www/ecodeli-frontend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 