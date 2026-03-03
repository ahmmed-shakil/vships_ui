module.exports = {
  apps: [
    {
      name: 'perfomax-client',
      script: 'npm',
      args: 'start',
      cwd: './',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
