module.exports = {
  apps: [
    {
      name: 'ecodeli-frontend',
      script: 'start.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: 'localhost'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: 'localhost'
      },
      watch: false,
      max_memory_restart: '1G',
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}; 