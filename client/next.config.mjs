/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
