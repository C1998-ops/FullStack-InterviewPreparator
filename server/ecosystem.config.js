// PM2 ecosystem file for production deployment
// Note: For ES modules, use interpreter: 'node' and ensure type: 'module' in package.json
export default {
  apps: [
    {
      name: 'interview-api',
      script: './server.js',
      interpreter: 'node',
      instances: 2, // Use 2 instances for load balancing
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};

