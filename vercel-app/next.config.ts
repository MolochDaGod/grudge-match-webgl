import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@solana/web3.js', '@solana/wallet-adapter-react'],
  },
  
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Configure static file serving
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static export if needed
  },
  
  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    NEXT_PUBLIC_GBUX_TOKEN_MINT: process.env.NEXT_PUBLIC_GBUX_TOKEN_MINT,
    NEXT_PUBLIC_TREASURY_WALLET: process.env.NEXT_PUBLIC_TREASURY_WALLET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // During CI/deploy, don't fail the build on ESLint issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // During CI/deploy, optionally skip type errors (keep true only if needed)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack configuration for better bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for Solana and Web3 libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add rule for handling audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
        },
      },
    });
    
    return config;
  },
};

export default nextConfig;
