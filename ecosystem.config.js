module.exports = {
  apps: [
    {
      name: 'perfomax-client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/deploy/actions-runner/_work/nura_client/nura_client',
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
