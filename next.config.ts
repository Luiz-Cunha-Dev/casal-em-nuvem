import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'objectstorage.us-ashburn-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.us-phoenix-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.eu-frankfurt-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.ap-tokyo-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.uk-london-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.sa-saopaulo-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.ca-toronto-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.ap-mumbai-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.ap-seoul-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.ap-sydney-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
      {
        protocol: 'https',
        hostname: 'objectstorage.eu-zurich-1.oraclecloud.com',
        port: '',
        pathname: '/n/**',
      },
    ],
  },
};

export default nextConfig;
