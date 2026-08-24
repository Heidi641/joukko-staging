/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
