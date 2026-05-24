/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow static export when all pages are static
  // This can be toggled to 'export' for full static generation
  // output: 'export',
};

module.exports = nextConfig;
