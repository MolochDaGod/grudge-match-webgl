# 🏰 Grudge Tower - 4D Character Interface

A complete HTML/JavaScript interface for building and customizing 4D characters that integrate with the Grudge Tower defense game. This system connects your Unity-based character creation pipeline with blockchain-powered GBUX transactions and tower deployment.

## 🎯 Overview

This 4D Character Interface provides:

- **Visual Character Builder**: Interactive equipment system with real-time stat calculations
- **GBUX Integration**: Solana wallet connection for purchasing premium items
- **Catalog Integration**: Loads items from your dApp builder pipeline
- **Tower Conversion**: Transforms characters into deployable tower units
- **Unity Export**: Compatible with your existing Unity character export system

## 📁 System Components

### Core Files
- `character-interface.html` - Main character builder interface
- `catalog-integration.js` - Connects to dApp builder catalog system
- `gbux-wallet.js` - Solana wallet and GBUX token integration
- `tower-integration.js` - Character-to-tower conversion system

### Integration Points
- Reads from `../dapp-builder/catalog/` directory for item data
- Connects to Unity character export system
- Interfaces with GBUX token contract: `55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray`
- Admin wallet: `DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy`

## 🚀 Quick Start

### 1. Setup Files
```bash
# Ensure all files are in the same directory:
character-interface.html
catalog-integration.js
gbux-wallet.js
tower-integration.js
```

### 2. Run the Interface
Open `character-interface.html` in a modern web browser (Chrome/Firefox recommended).

### 3. Connect Wallet (Optional)
Click "Connect Wallet" to connect a Phantom wallet for GBUX transactions.

### 4. Customize Character
- Browse items in the store (right panel)
- Purchase items with GBUX tokens
- Equip items to your character
- Watch stats update in real-time

### 5. Deploy to Tower
Click "🏰 Deploy to Tower" to convert your character into a tower unit.

## 🎮 Features

### Character Customization
- **Equipment Slots**: Weapon, Armor, Helmet, Accessory
- **Real-time Stats**: Health, Attack, Defense, DPS, Tower Value, Build Cost
- **Visual Display**: Equipment icons and character representation
- **Template System**: Pre-built Warrior, Mage, and Archer configurations

### Item Store
- **Tabbed Interface**: Weapons, Armor, Accessories
- **GBUX Pricing**: Based on rarity and item type
- **Ownership Tracking**: Visual indicators for owned items
- **Purchase System**: Secure blockchain transactions

### Tower Integration
- **Smart Conversion**: Equipment determines tower type (Warrior/Archer/Mage/Hybrid)
- **Ability System**: Special abilities based on equipped items
- **Stat Calculation**: Advanced formulas considering rarity bonuses
- **Visual Data**: Tower appearance based on character equipment

## 🔧 Technical Integration

### Catalog Integration
The system automatically loads item data from your dApp builder:

```javascript
// Loads from dapp-builder/catalog/
- catalog.json          // Complete item database
- store-items.json      // GBUX purchasable items
- category-index.json   // Item organization
- character-templates.json // Pre-built character setups
```

### Wallet Integration
GBUX transactions through Solana:

```javascript
// Connect wallet
await walletIntegration.connect();

// Purchase item
const result = await walletIntegration.purchaseItem(itemId, price, name);

// Check balance
const balance = await walletIntegration.getGBUXBalance(walletAddress);
```

### Tower Deployment
Characters convert to tower data:

```javascript
// Convert character to tower
const towerIntegration = new TowerIntegration();
const tower = towerIntegration.convertCharacterToTower(character);

// Tower types: 'warrior', 'archer', 'mage', 'hybrid'
// Based on equipped weapons and armor
```

## 📊 Item Categories & Pricing

### Weapons (10-100 GBUX)
- **Melee 1H**: Swords, Axes, Hammers (10-25 GBUX)
- **Melee 2H**: Great weapons (15-30 GBUX) 
- **Ranged**: Bows, Crossbows (12-25 GBUX)
- **Firearms**: Pistols, Rifles (20-60 GBUX)

### Armor (15-60 GBUX)
- **Body Armor**: Leather to Plate (15-60 GBUX)
- **Helmets**: Head protection (8-25 GBUX)
- **Shields**: Defensive equipment (8-30 GBUX)

### Accessories (7-100 GBUX)
- **Wings**: Flight abilities (100 GBUX)
- **Rings**: Stat bonuses (30 GBUX)
- **Masks**: Special effects (7-35 GBUX)

### Rarity System
- **Common**: Base pricing, starter items
- **Rare**: +20% pricing, improved stats
- **Epic**: +50% pricing, special abilities
- **Legendary**: +100% pricing, unique effects

## 🎯 Tower Types

### Warrior Tower
- **Triggers**: Melee weapons, heavy armor
- **Stats**: High health/defense, moderate attack
- **Range**: 2.5 units (short range)
- **Abilities**: Block, Charge, Damage Reduction

### Archer Tower  
- **Triggers**: Bows, crossbows, light armor
- **Stats**: High attack, moderate health
- **Range**: 8.0 units (long range)
- **Abilities**: Piercing Shot, Multi-Target

### Mage Tower
- **Triggers**: Fire weapons, magical accessories
- **Stats**: Very high attack, low defense
- **Range**: 6.0 units (medium range)
- **Abilities**: Area Damage, Slow, Burn Damage

### Hybrid Tower
- **Triggers**: Mixed equipment setups
- **Stats**: Balanced across all areas
- **Range**: 4.0 units (medium range)
- **Abilities**: Adaptive, Buff Nearby Towers

## 🔗 Unity Integration

### Character Export Format
The system exports Unity-compatible character data:

```json
{
  "CharacterName": "Grudge Tower Hero",
  "EquippedItems": [
    {
      "ItemId": "sword_fire",
      "ItemName": "Fire Sword",
      "ItemType": "Weapon",
      "Rarity": "epic",
      "IsGBUXItem": true,
      "BasePrice": 50,
      "Properties": [
        {"PropertyId": "Attack", "ValueInt": 35}
      ]
    }
  ],
  "Stats": {
    "Health": 120,
    "Attack": 60,
    "Defense": 25,
    "DPS": 102,
    "TowerValue": 13.5,
    "BuildCost": 81
  }
}
```

### Tower Export Format
For the tower defense game:

```json
{
  "TowerData": {
    "Id": "tower_1234567890_abc123",
    "Name": "Fire Warrior",
    "Type": "warrior",
    "Stats": {
      "Health": 156,
      "Attack": 72,
      "Defense": 37,
      "Range": 2.5,
      "AttackSpeed": 1.0,
      "BuildCost": 81
    },
    "Abilities": ["block", "charge", "burn_damage"],
    "Equipment": {...}
  }
}
```

## 💾 Data Storage

### Local Storage Keys
- `grudgeTowerCharacter` - Saved character configuration
- `grudgeTowerDeployment` - Tower deployment data
- `towerConfigurations` - Saved tower templates
- `ownedItems_{walletAddress}` - User's purchased items

### Blockchain Storage
- GBUX token balances on Solana
- Purchase transaction history
- Item ownership records

## 🛠️ Development

### Adding New Items
1. Add items to your dApp builder catalog
2. Run the asset pipeline: `npm run build`
3. Items automatically appear in the interface

### Custom Tower Types
Modify `tower-integration.js` to add new tower types:

```javascript
// Add to towerTemplates
newType: {
    baseType: 'special',
    attackType: 'unique',
    range: 5.0,
    attackSpeed: 1.2,
    abilities: ['new_ability'],
    multipliers: { attack: 1.3, defense: 1.0, health: 1.1 }
}
```

### Custom Abilities
Add equipment-based abilities:

```javascript
// In generateTowerAbilities()
case 'new_special':
    abilities.push('unique_power');
    break;
```

## 🔒 Security

### Wallet Security
- Private keys never stored in browser
- All transactions require user confirmation
- Environment variables for admin wallet access

### Transaction Validation  
- Server-side balance verification
- Blockchain transaction confirmation
- Duplicate purchase prevention

### Data Integrity
- Character stat validation
- Equipment compatibility checks
- Save data encryption support

## 🚀 Deployment

### Production Setup
1. **Configure Environment Variables**
   ```bash
   GBUX_TOKEN_MINT=55TpSoMNxbfsNJ9U1dQoo9H3dRtDmjBZVMcKqvU2nray
   ADMIN_WALLET=DRJiootURSQeGhQXjLVpbnfDndpTG9DsPFo2oLaa5xpy
   NODE_ENV=production
   ```

2. **Setup Catalog Pipeline**
   - Ensure dApp builder is running: `npm run build`
   - Verify catalog files are generated
   - Set correct file paths in catalog-integration.js

3. **Deploy Files**
   - Host all files on same domain
   - Enable HTTPS for wallet connections
   - Configure CORS if needed

### Testing
- Test wallet connection (Phantom recommended)
- Verify GBUX balance display
- Test item purchasing flow
- Confirm character-to-tower conversion
- Validate Unity integration

## 📞 Support

For questions or issues:

1. **Character Interface**: Check browser console for errors
2. **Wallet Issues**: Ensure Phantom wallet is installed and connected
3. **Catalog Loading**: Verify dApp builder pipeline is running
4. **Tower Deployment**: Check localStorage for deployment data

## 🎉 Success!

You now have a complete 4D Character Interface that:
- ✅ Loads items from your dApp builder catalog
- ✅ Handles GBUX wallet transactions
- ✅ Provides visual character customization
- ✅ Converts characters to tower units
- ✅ Integrates with Unity character export system
- ✅ Supports the complete Grudge Tower ecosystem

Your players can now customize characters in the web interface and deploy them as towers in your Unity tower defense game!