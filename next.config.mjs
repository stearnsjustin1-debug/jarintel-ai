/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mapbox-gl'],
  experimental: {
    turbo: undefined,
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, 'mapbox-gl': 'mapbox-gl' }
    return config
  },
};

export default nextConfig;
