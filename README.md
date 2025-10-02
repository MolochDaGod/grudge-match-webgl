# 🏰 Grudge Tower - 4D Character Builder

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMolochDaGod%2Fgrudge-match-webgl&project-name=grudge-tower-4d-characters&repository-name=grudge-tower-4d-characters)

A complete web interface for building and customizing 4D characters that integrate with the Grudge Tower defense game. This system connects Unity-based character creation with blockchain-powered GBUX transactions and tower deployment.

## ✨ Features

- **🎮 Interactive Character Builder**: Real-time equipment and stat system
- **💰 GBUX Integration**: Solana wallet connection for premium items  
- **🔗 Catalog Integration**: Loads items from Unity dApp builder pipeline
- **🏗️ Tower Conversion**: Transforms characters into deployable tower units
- **📱 Mobile Responsive**: Works on desktop and mobile devices
- **🔒 Blockchain Security**: Secure GBUX token transactions

## 🚀 Live Demo

Visit the live deployment: **[https://grudge-match-webgl.vercel.app](https://grudge-match-webgl.vercel.app)**

## 🎯 Quick Start

1. **Connect Wallet** (optional): Connect your Phantom wallet for GBUX transactions
2. **Browse Store**: View available weapons, armor, and accessories
3. **Purchase Items**: Buy items with GBUX tokens or use demo items
4. **Customize Character**: Equip items and watch stats update
5. **Deploy Tower**: Convert your character into a tower unit

## 📊 Tower Types

Your equipment determines your tower type:

- **🗡️ Warrior**: Melee weapons + Heavy armor → High defense, short range
- **🏹 Archer**: Ranged weapons + Light armor → High attack, long range  
- **🔮 Mage**: Fire/Magic weapons + Accessories → Area damage, medium range
- **⚖️ Hybrid**: Mixed equipment → Balanced stats, versatile abilities

## 💎 Item System

### Weapons (10-100 GBUX)
- **Melee**: Swords, Axes, Hammers
- **Ranged**: Bows, Crossbows, Firearms
- **Magic**: Fire Swords, Ice Weapons

### Armor (8-60 GBUX)  
- **Body Armor**: Leather to Legendary Plate
- **Helmets**: Head protection with stat bonuses
- **Shields**: Defensive equipment

### Accessories (7-100 GBUX)
- **Wings**: Flight abilities (100 GBUX)
- **Rings**: Attack/Defense bonuses
- **Masks**: Special visual effects

## 🔧 Technical Details

### Built With
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Blockchain**: Solana, GBUX Token
- **Deployment**: Vercel
- **Integration**: Unity WebGL, dApp Builder Pipeline

### File Structure
```
├── index.html                     # Main character interface
├── catalog-integration.js         # Loads items from dApp builder
├── gbux-wallet.js                 # Solana wallet integration
├── tower-integration.js           # Character-to-tower conversion
├── vercel.json                    # Deployment configuration
└── README.md                      # This file
```

### Environment Variables
```bash
GBUX_TOKEN_MINT=55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray
ADMIN_WALLET=DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy
NODE_ENV=production
```

## 🚀 Deploy Your Own

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMolochDaGod%2Fgrudge-match-webgl&project-name=grudge-tower-4d-characters&repository-name=grudge-tower-4d-characters)

### Option 2: Manual Deployment

```bash
# Clone the repository
git clone https://github.com/MolochDaGod/grudge-match-webgl.git
cd grudge-match-webgl

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 3: Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎮 Integration

This interface integrates with:

- **Unity Game**: Character export/import system
- **dApp Builder**: Asset catalog and optimization pipeline  
- **Solana Blockchain**: GBUX token transactions
- **Tower Defense Game**: Character-to-tower deployment

## 🔒 Security

- Private keys never stored in browser
- All transactions require user confirmation
- Environment variables for sensitive data
- CORS protection and security headers

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Demo**: [https://grudge-match-webgl.vercel.app](https://grudge-match-webgl.vercel.app)
- **GitHub**: [https://github.com/MolochDaGod/grudge-match-webgl](https://github.com/MolochDaGod/grudge-match-webgl)
- **GBUX Token**: [View on Solscan](https://solscan.io/token/55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray)

---

Built with ❤️ for the Grudge Tower ecosystem