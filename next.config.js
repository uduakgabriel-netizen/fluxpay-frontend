/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@solana/web3.js',
    'rpc-websockets',
    'uuid'
  ],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
