module.exports = {
  apps: [
    {
      name: 'vships-client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/deploy/actions-runner-vships/_work/vships_ui/vships_ui',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
    },
  ],
};
