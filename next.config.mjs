/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/testi",
        destination: "/testaa",
        permanent: false
      },
      {
        source: "/testaajat",
        destination: "/testaa",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
