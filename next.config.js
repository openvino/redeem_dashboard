const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*', // Ruta API donde deseas habilitar CORS
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://147.182.205.152', // Cambia esto al origen específico permitido
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
