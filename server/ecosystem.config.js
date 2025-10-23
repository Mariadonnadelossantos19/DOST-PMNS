// PMNS 2.0 Production PM2 Configuration
// This file configures PM2 for production deployment on Ubuntu

module.exports = {
  apps: [{
    name: 'pmns-server',
    script: './src/server.js',
    cwd: './server',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster', // Cluster mode for better performance
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    // Logging configuration
    error_file: '/var/log/pm2/pmns-error.log',
    out_file: '/var/log/pm2/pmns-out.log',
    log_file: '/var/log/pm2/pmns-combined.log',
    time: true,
    
    // Auto-restart configuration
    watch: false, // Don't watch files in production
    max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
    
    // Health monitoring
    min_uptime: '10s', // Minimum uptime before considering stable
    max_restarts: 10, // Maximum restarts in 1 minute
    
    // Environment specific settings
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
