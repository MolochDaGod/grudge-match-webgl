# Grudge Tower 4D - Deployment Guide

This guide covers deploying the Grudge Tower 4D character builder to Vercel.

## Prerequisites

1. Node.js 24.9.0 (as specified in user preferences)
2. Vercel account
3. GitHub repository access
4. GBUX token contract address on Solana
5. Treasury wallet address for receiving payments

## Environment Variables

Before deployment, configure these environment variables in your Vercel dashboard:

### Required Variables:
```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # or mainnet-beta for production
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_GBUX_TOKEN_MINT=YOUR_GBUX_TOKEN_MINT_ADDRESS
NEXT_PUBLIC_TREASURY_WALLET=YOUR_TREASURY_WALLET_ADDRESS
```

### Optional Variables:
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-custom-rpc-endpoint.com  # For better performance
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/MolochDaGod/grudge-match-webgl.git
cd grudge-match-webgl
git checkout 4dgame
cd grudge-tower-4d
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Vercel Deployment

### Method 1: Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Select the `4dgame` branch
3. Set the Root Directory to `grudge-tower-4d`
4. Configure environment variables in Vercel dashboard
5. Deploy

### Method 2: Vercel CLI
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from project directory:
```bash
cd grudge-tower-4d
vercel --prod
```

3. Follow prompts and configure environment variables

## Project Structure

```
grudge-tower-4d/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── CharacterBuilder.tsx    # Main builder interface
│   │   ├── AttributeControls.tsx   # 4D attribute controls
│   │   ├── AppearanceControls.tsx  # Visual customization
│   │   ├── CharacterPreview.tsx    # Live character preview
│   │   └── TokenBalance.tsx        # GBUX balance display
│   ├── contexts/            # React contexts
│   │   └── WalletContextProvider.tsx # Solana wallet integration
│   ├── services/            # Business logic
│   │   ├── CharacterService.ts     # Character management
│   │   └── GbuxTokenService.ts     # Token operations
│   └── types/               # TypeScript definitions
│       └── Character.ts     # Character data types
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── next.config.ts          # Next.js configuration
```

## Features

### Character Creation
- 8-attribute system: Strength, Defense, Speed, Intelligence, Temporal, Spatial, Consciousness, Harmony
- Point allocation system (80 starting points)
- Character rarity based on total attribute points
- Visual customization with 4D effects

### Solana Integration
- Phantom wallet connection
- GBUX token balance checking
- Character minting cost calculation
- Transaction handling for character purchases

### Game Integration
- Character-to-tower conversion system
- JSON export for game integration
- Special abilities generation based on attributes
- Tower configuration with visual effects

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Troubleshooting

### Common Issues:

1. **Wallet Connection Issues**
   - Ensure Phantom wallet is installed
   - Check if you're on the correct Solana network
   - Verify RPC endpoint is accessible

2. **Token Balance Not Loading**
   - Confirm GBUX token mint address is correct
   - Check if wallet has token account created
   - Verify RPC endpoint has token program support

3. **Build Errors**
   - Ensure all environment variables are set
   - Check Node.js version compatibility
   - Clear `.next` and `node_modules`, then reinstall

4. **Deployment Failures**
   - Verify environment variables in Vercel dashboard
   - Check build logs for specific errors
   - Ensure all dependencies are in package.json

## Security Notes

- All private keys remain client-side
- No sensitive data is stored on servers
- Token transactions require user approval
- Environment variables are properly scoped with NEXT_PUBLIC_ prefix

## Performance Optimization

- Uses Turbopack for faster builds
- Lazy loading for heavy components
- Optimized bundle size with tree shaking
- Efficient re-renders with React patterns

## Support

For issues or questions:
1. Check GitHub issues in the repository
2. Review Vercel deployment logs
3. Test locally first before deploying
4. Ensure all dependencies are up to date