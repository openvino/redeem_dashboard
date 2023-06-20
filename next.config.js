/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Permite todas las solicitudes desde cualquier origen
        source: '/api/:path*', // Ruta API donde deseas habilitar CORS
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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
}

module.exports = nextConfig
