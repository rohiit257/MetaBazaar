/** @type {import('next').NextConfig} */
import path from 'path';
const __dirname = new URL('.', import.meta.url).pathname;
const nextConfig = {
  images: {
    domains: [
      "api.microlink.io",
      'images.unsplash.com', 
      'assets.aceternity.com'// Microlink Image Preview
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
     ...config.resolve.alias,
    '@': path.resolve(__dirname, './'),
     };
    return config;
    },
};

export default nextConfig;
