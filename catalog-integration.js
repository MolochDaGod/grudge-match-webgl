/**
 * Grudge Tower - Catalog Integration Module
 * Connects the 4D Character Interface with the dApp Builder catalog system
 */

class CatalogIntegration {
    constructor() {
        this.catalogData = null;
        this.characterExports = [];
        this.catalogPath = '../dapp-builder/catalog/';
        this.unityExportsPath = '../dapp-builder/unity-exports/';
    }

    /**
     * Initialize the catalog system by loading data from the dApp builder
     */
    async initialize() {
        try {
            await this.loadCatalogData();
            await this.loadCharacterExports();
            console.log('Catalog Integration initialized successfully');
        } catch (error) {
            console.warn('Failed to load catalog data, using fallback:', error);
            this.useFallbackData();
        }
    }

    /**
     * Load catalog data from the dApp builder pipeline
     */
    async loadCatalogData() {
        const catalogFiles = [
            'catalog.json',
            'store-items.json',
            'category-index.json',
            'character-templates.json'
        ];

        const catalogPromises = catalogFiles.map(async (file) => {
            try {
                const response = await fetch(`${this.catalogPath}${file}`);
                if (response.ok) {
                    return { [file.split('.')[0]]: await response.json() };
                }
                return null;
            } catch (error) {
                console.warn(`Failed to load ${file}:`, error);
                return null;
            }
        });

        const results = await Promise.all(catalogPromises);
        this.catalogData = results.reduce((acc, result) => {
            if (result) {
                return { ...acc, ...result };
            }
            return acc;
        }, {});

        // Transform catalog data into the format expected by the interface
        this.transformCatalogData();
    }

    /**
     * Transform catalog data from dApp builder format to interface format
     */
    transformCatalogData() {
        if (!this.catalogData.catalog) return;

        const transformed = {
            weapons: { melee: [], ranged: [] },
            armor: [],
            accessories: []
        };

        // Process each item in the catalog
        Object.values(this.catalogData.catalog).forEach(item => {
            const transformedItem = {
                id: item.id,
                name: item.name,
                price: item.gbuxPrice || 0,
                attack: item.stats?.attack || 0,
                defense: item.stats?.defense || 0,
                rarity: item.rarity || 'common',
                icon: this.getItemIcon(item.category, item.name),
                category: item.category,
                description: item.description || '',
                imageUrl: item.optimizedSpritePath || item.spritePath
            };

            // Categorize items
            switch (item.category) {
                case 'melee-weapon-1h':
                case 'melee-weapon-2h':
                    transformed.weapons.melee.push(transformedItem);
                    break;
                case 'bow':
                case 'crossbow':
                case 'firearm-1h':
                case 'firearm-2h':
                    transformed.weapons.ranged.push(transformedItem);
                    break;
                case 'armor':
                case 'helmet':
                case 'shield':
                case 'shoes':
                case 'gloves':
                    transformed.armor.push(transformedItem);
                    break;
                case 'wings':
                case 'mask':
                case 'cape':
                    transformed.accessories.push(transformedItem);
                    break;
            }
        });

        this.transformedCatalog = transformed;
    }

    /**
     * Get appropriate icon for item based on category and name
     */
    getItemIcon(category, name) {
        const iconMap = {
            'melee-weapon-1h': this.getSwordIcon(name),
            'melee-weapon-2h': this.getTwoHandedIcon(name),
            'bow': '🏹',
            'crossbow': '🏹',
            'firearm-1h': '🔫',
            'firearm-2h': '🔫',
            'armor': '🦺',
            'helmet': '⛑️',
            'shield': '🛡️',
            'shoes': '👢',
            'gloves': '🧤',
            'wings': '🐉',
            'mask': '🎭',
            'cape': '🧥'
        };

        return iconMap[category] || '⚔️';
    }

    getSwordIcon(name) {
        if (name.toLowerCase().includes('fire')) return '🔥⚔️';
        if (name.toLowerCase().includes('ice')) return '❄️⚔️';
        if (name.toLowerCase().includes('axe')) return '🪓';
        if (name.toLowerCase().includes('hammer')) return '🔨';
        if (name.toLowerCase().includes('dagger')) return '🗡️';
        return '⚔️';
    }

    getTwoHandedIcon(name) {
        if (name.toLowerCase().includes('axe')) return '🪓';
        if (name.toLowerCase().includes('hammer')) return '🔨';
        return '⚔️';
    }

    /**
     * Load character export files from Unity
     */
    async loadCharacterExports() {
        try {
            // Try to load character exports from the Unity export directory
            const response = await fetch(`${this.unityExportsPath}character-exports.json`);
            if (response.ok) {
                this.characterExports = await response.json();
            }
        } catch (error) {
            console.warn('No character exports found:', error);
        }
    }

    /**
     * Use fallback data when catalog files are not available
     */
    useFallbackData() {
        this.transformedCatalog = {
            weapons: {
                melee: [
                    { id: "sword_iron", name: "Iron Sword", price: 10, attack: 15, rarity: "common", icon: "⚔️" },
                    { id: "sword_fire", name: "Fire Sword", price: 50, attack: 35, rarity: "epic", icon: "🔥⚔️" },
                    { id: "axe_battle", name: "Battle Axe", price: 25, attack: 30, rarity: "rare", icon: "🪓" },
                    { id: "hammer_war", name: "War Hammer", price: 30, attack: 32, rarity: "rare", icon: "🔨" },
                    { id: "sword_legendary", name: "Legendary Blade", price: 100, attack: 50, rarity: "legendary", icon: "✨⚔️" }
                ],
                ranged: [
                    { id: "bow_wood", name: "Wooden Bow", price: 8, attack: 20, rarity: "common", icon: "🏹" },
                    { id: "crossbow_steel", name: "Steel Crossbow", price: 40, attack: 45, rarity: "epic", icon: "🏹" },
                    { id: "gun_pistol", name: "Magic Pistol", price: 60, attack: 35, rarity: "epic", icon: "🔫" }
                ]
            },
            armor: [
                { id: "armor_leather", name: "Leather Armor", price: 15, defense: 10, rarity: "common", icon: "🦺" },
                { id: "armor_plate", name: "Plate Armor", price: 60, defense: 35, rarity: "legendary", icon: "🛡️" },
                { id: "helmet_iron", name: "Iron Helmet", price: 20, defense: 8, rarity: "common", icon: "⛑️" },
                { id: "shield_knight", name: "Knight Shield", price: 25, defense: 15, rarity: "rare", icon: "🛡️" }
            ],
            accessories: [
                { id: "wings_dragon", name: "Dragon Wings", price: 100, special: "flight", rarity: "legendary", icon: "🐉" },
                { id: "ring_power", name: "Power Ring", price: 30, attack: 10, rarity: "rare", icon: "💍" },
                { id: "cape_hero", name: "Hero's Cape", price: 45, defense: 5, attack: 5, rarity: "epic", icon: "🧥" },
                { id: "mask_shadow", name: "Shadow Mask", price: 35, attack: 8, rarity: "rare", icon: "🎭" }
            ]
        };
    }

    /**
     * Get catalog data for the interface
     */
    getCatalog() {
        return this.transformedCatalog || this.useFallbackData();
    }

    /**
     * Get store items (items available for GBUX purchase)
     */
    getStoreItems() {
        if (this.catalogData && this.catalogData['store-items']) {
            return this.catalogData['store-items'];
        }
        
        // Return all items as purchasable if no store-items data
        const allItems = [];
        const catalog = this.getCatalog();
        
        [...catalog.weapons.melee, ...catalog.weapons.ranged, ...catalog.armor, ...catalog.accessories]
            .forEach(item => {
                if (item.price > 0) {
                    allItems.push(item);
                }
            });
            
        return allItems;
    }

    /**
     * Get character templates
     */
    getCharacterTemplates() {
        if (this.catalogData && this.catalogData['character-templates']) {
            return this.catalogData['character-templates'];
        }

        // Return default templates
        return {
            warrior: {
                name: "Warrior Build",
                description: "Balanced melee fighter",
                equipment: {
                    weapon: "sword_iron",
                    armor: "armor_leather",
                    helmet: "helmet_iron"
                }
            },
            mage: {
                name: "Mage Build", 
                description: "Magic-focused character",
                equipment: {
                    weapon: "sword_fire",
                    accessory: "ring_power",
                    cape: "cape_hero"
                }
            },
            archer: {
                name: "Archer Build",
                description: "Ranged combat specialist", 
                equipment: {
                    weapon: "bow_wood",
                    armor: "armor_leather"
                }
            }
        };
    }

    /**
     * Save character export data compatible with Unity system
     */
    exportCharacter(characterData) {
        const exportData = {
            CharacterName: characterData.name || "Grudge Tower Hero",
            ExportTime: new Date().toISOString(),
            Appearance: {
                BodyType: "Human",
                SkinColor: "#FFDBAC",
                HairStyle: "Basic_Hair_01",
                HairColor: "#8B4513"
            },
            EquippedItems: [],
            Stats: {
                Health: characterData.stats.health,
                Attack: characterData.stats.attack,
                Defense: characterData.stats.defense,
                DPS: parseFloat(characterData.stats.dps),
                TowerValue: parseFloat(characterData.stats.towerValue),
                BuildCost: characterData.stats.buildCost
            },
            TowerStats: {
                BuildCost: characterData.stats.buildCost,
                AttackSpeed: 1.0,
                CriticalChance: 0.05,
                Range: 5.0
            }
        };

        // Add equipped items
        Object.entries(characterData.equipment).forEach(([slot, item]) => {
            if (item) {
                exportData.EquippedItems.push({
                    ItemId: item.id,
                    ItemName: item.name,
                    ItemType: this.getUnityItemType(slot),
                    Rarity: item.rarity,
                    IsGBUXItem: item.price > 0,
                    BasePrice: item.price,
                    Properties: [
                        ...(item.attack ? [{ PropertyId: "Attack", ValueInt: item.attack }] : []),
                        ...(item.defense ? [{ PropertyId: "Defense", ValueInt: item.defense }] : [])
                    ]
                });
            }
        });

        return exportData;
    }

    /**
     * Convert equipment slot to Unity item type
     */
    getUnityItemType(slot) {
        const typeMap = {
            weapon: "Weapon",
            armor: "Armor", 
            helmet: "Helmet",
            accessory: "Accessory"
        };
        return typeMap[slot] || "Item";
    }

    /**
     * Load character from Unity export format
     */
    importCharacter(unityExportData) {
        const character = {
            name: unityExportData.CharacterName || "Imported Hero",
            equipment: {
                weapon: null,
                armor: null,
                helmet: null,
                accessory: null
            },
            stats: {
                health: unityExportData.Stats?.Health || 100,
                attack: unityExportData.Stats?.Attack || 25,
                defense: unityExportData.Stats?.Defense || 15,
                dps: unityExportData.Stats?.DPS || 42.5,
                towerValue: unityExportData.Stats?.TowerValue || 7.5,
                buildCost: unityExportData.Stats?.BuildCost || 50
            }
        };

        // Map equipped items back to character
        if (unityExportData.EquippedItems) {
            unityExportData.EquippedItems.forEach(item => {
                const slot = this.getSlotFromItemType(item.ItemType);
                if (slot) {
                    character.equipment[slot] = {
                        id: item.ItemId,
                        name: item.ItemName,
                        price: item.BasePrice || 0,
                        rarity: item.Rarity || 'common',
                        attack: this.getPropertyValue(item.Properties, 'Attack'),
                        defense: this.getPropertyValue(item.Properties, 'Defense'),
                        icon: this.getItemIcon(item.ItemType.toLowerCase(), item.ItemName)
                    };
                }
            });
        }

        return character;
    }

    /**
     * Convert Unity item type back to equipment slot
     */
    getSlotFromItemType(itemType) {
        const slotMap = {
            "Weapon": "weapon",
            "Armor": "armor",
            "Helmet": "helmet", 
            "Accessory": "accessory"
        };
        return slotMap[itemType];
    }

    /**
     * Get property value from Unity properties array
     */
    getPropertyValue(properties, propertyId) {
        if (!properties) return 0;
        const prop = properties.find(p => p.PropertyId === propertyId);
        return prop ? prop.ValueInt : 0;
    }

    /**
     * Check if user owns a specific item based on GBUX transactions
     */
    async checkItemOwnership(walletAddress, itemId) {
        // This would normally check blockchain transactions
        // For now, return true for demo items
        const demoOwnedItems = ['sword_iron', 'bow_wood', 'armor_leather', 'helmet_iron'];
        return demoOwnedItems.includes(itemId);
    }

    /**
     * Get user's owned items from blockchain/local storage
     */
    async getUserOwnedItems(walletAddress) {
        // In production, this would query the blockchain for GBUX purchase transactions
        // For demo purposes, return some sample items
        const stored = localStorage.getItem(`ownedItems_${walletAddress}`);
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default owned items for demo
        return ['sword_iron', 'bow_wood', 'armor_leather'];
    }

    /**
     * Record item purchase (would normally be a blockchain transaction)
     */
    async purchaseItem(walletAddress, itemId, gbuxAmount) {
        // In production, this would create a Solana transaction
        // For demo, just add to local storage
        const ownedItems = await this.getUserOwnedItems(walletAddress);
        if (!ownedItems.includes(itemId)) {
            ownedItems.push(itemId);
            localStorage.setItem(`ownedItems_${walletAddress}`, JSON.stringify(ownedItems));
        }
        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CatalogIntegration;
} else {
    window.CatalogIntegration = CatalogIntegration;
}