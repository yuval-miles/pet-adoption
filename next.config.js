/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["pet-adopt-app.s3.eu-central-1.amazonaws.com"],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
