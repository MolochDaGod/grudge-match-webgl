# Grudge Tower 4D Character Builder

A modern character creation interface for the Grudge Tower universe built with Next.js, Solana Web3, and real GBUX token integration.

## 🚀 Features

- **8-Attribute 4D System**: Create characters with traditional RPG stats plus 4D powers
- **Real GBUX Integration**: Mainnet Solana token support with address `55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray`
- **Phantom Wallet Support**: Seamless Web3 wallet integration
- **Dynamic Character Preview**: Animated visual character representation
- **Tower Conversion**: Characters transform into tower defense units
- **NFT Minting**: Characters can be minted as NFTs using GBUX tokens

## 🛠 Technology Stack

- Next.js 15 with Turbopack
- TypeScript
- Tailwind CSS 4
- Solana Web3.js
- Framer Motion
- Phantom Wallet Adapter

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the character builder.

## 🌐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_GBUX_TOKEN_MINT=55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray
NEXT_PUBLIC_TREASURY_WALLET=DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy
```

## 🏰 Character System

### Attributes (1-20 each)
- **Physical**: Strength, Defense, Speed, Intelligence
- **4D Powers**: Temporal, Spatial, Consciousness, Harmony

### Rarity Levels
- Common (80-100 pts) → Mythic (181-200 pts)
- Costs scale exponentially with total points

## 💰 GBUX Token Economics

- Base minting cost: 100 GBUX
- Exponential scaling with character power
- Payments to AI agent treasury: `DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy`

## 🚀 Deploy on Vercel

The app is optimized for Vercel deployment with automatic framework detection.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MolochDaGod/grudge-match-webgl/tree/4dgame&root-directory=grudge-tower-4d)
