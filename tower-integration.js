/**
 * Grudge Tower - Tower Defense Integration Module
 * Converts 4D characters into tower units for the tower defense game
 */

class TowerIntegration {
    constructor() {
        this.deployedTowers = [];
        this.towerTemplates = this.initializeTowerTemplates();
        this.statCalculator = new TowerStatCalculator();
    }

    /**
     * Initialize tower templates with base stats and abilities
     */
    initializeTowerTemplates() {
        return {
            warrior: {
                baseType: 'melee',
                attackType: 'physical',
                range: 2.5,
                attackSpeed: 1.0,
                abilities: ['block', 'charge'],
                multipliers: { attack: 1.2, defense: 1.5, health: 1.3 }
            },
            archer: {
                baseType: 'ranged',
                attackType: 'physical',
                range: 8.0,
                attackSpeed: 1.5,
                abilities: ['piercing_shot', 'multi_target'],
                multipliers: { attack: 1.0, defense: 0.8, health: 1.0 }
            },
            mage: {
                baseType: 'magic',
                attackType: 'magical',
                range: 6.0,
                attackSpeed: 0.8,
                abilities: ['area_damage', 'slow'],
                multipliers: { attack: 1.4, defense: 0.7, health: 0.9 }
            },
            hybrid: {
                baseType: 'versatile',
                attackType: 'mixed',
                range: 4.0,
                attackSpeed: 1.1,
                abilities: ['adaptive', 'buff_nearby'],
                multipliers: { attack: 1.1, defense: 1.1, health: 1.1 }
            }
        };
    }

    /**
     * Convert a 4D character into a tower unit
     */
    convertCharacterToTower(character, position = null) {
        try {
            // Determine tower type based on equipment
            const towerType = this.determineTowerType(character.equipment);
            const template = this.towerTemplates[towerType];

            // Calculate tower stats
            const towerStats = this.statCalculator.calculateTowerStats(character, template);

            // Create tower data structure
            const tower = {
                id: this.generateTowerId(),
                characterName: character.name,
                towerType: towerType,
                position: position,
                stats: towerStats,
                equipment: this.processEquipmentForTower(character.equipment),
                abilities: this.generateTowerAbilities(character.equipment, template),
                visualData: this.createVisualData(character),
                deploymentCost: towerStats.buildCost,
                upkeepCost: Math.floor(towerStats.buildCost * 0.1),
                level: 1,
                experience: 0,
                kills: 0,
                damageDealt: 0,
                created: new Date().toISOString()
            };

            // Add special properties based on equipment
            this.addSpecialProperties(tower, character.equipment);

            return tower;
        } catch (error) {
            console.error('Failed to convert character to tower:', error);
            throw error;
        }
    }

    /**
     * Determine tower type based on equipped items
     */
    determineTowerType(equipment) {
        const { weapon, armor, accessory } = equipment;
        
        // Priority system for type determination
        if (weapon) {
            // Check for ranged weapons
            if (weapon.id.includes('bow') || weapon.id.includes('crossbow') || weapon.id.includes('gun')) {
                return 'archer';
            }
            
            // Check for magical weapons
            if (weapon.id.includes('fire') || weapon.id.includes('ice') || weapon.id.includes('wand') || weapon.name.toLowerCase().includes('magic')) {
                return 'mage';
            }
            
            // Default to warrior for melee weapons
            if (weapon.id.includes('sword') || weapon.id.includes('axe') || weapon.id.includes('hammer')) {
                return 'warrior';
            }
        }

        // Check accessories for special types
        if (accessory) {
            if (accessory.id.includes('wings') || accessory.id.includes('ring') && weapon) {
                return 'mage'; // Wings/magic rings suggest magical ability
            }
        }

        // Check armor type
        if (armor) {
            if (armor.id.includes('plate') || armor.id.includes('heavy')) {
                return 'warrior';
            }
            if (armor.id.includes('robe') || armor.id.includes('cloth')) {
                return 'mage';
            }
            if (armor.id.includes('leather') && weapon && weapon.id.includes('bow')) {
                return 'archer';
            }
        }

        // Mixed equipment suggests hybrid
        const hasWeapon = !!weapon;
        const hasArmor = !!armor;
        const hasAccessory = !!accessory;
        
        if (hasWeapon && hasArmor && hasAccessory) {
            return 'hybrid';
        }

        // Default fallback
        return 'warrior';
    }

    /**
     * Process equipment for tower use
     */
    processEquipmentForTower(equipment) {
        const towerEquipment = {};
        
        Object.entries(equipment).forEach(([slot, item]) => {
            if (item) {
                towerEquipment[slot] = {
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    bonuses: {
                        attack: item.attack || 0,
                        defense: item.defense || 0,
                        special: item.special || null
                    }
                };
            }
        });

        return towerEquipment;
    }

    /**
     * Generate abilities based on equipment and template
     */
    generateTowerAbilities(equipment, template) {
        const abilities = [...template.abilities];
        
        // Add equipment-based abilities
        Object.values(equipment).forEach(item => {
            if (item && item.special) {
                switch (item.special) {
                    case 'flight':
                        abilities.push('air_superiority');
                        break;
                    case 'fire':
                        abilities.push('burn_damage');
                        break;
                    case 'ice':
                        abilities.push('slow_enemies');
                        break;
                    case 'poison':
                        abilities.push('poison_damage');
                        break;
                }
            }
        });

        return [...new Set(abilities)]; // Remove duplicates
    }

    /**
     * Create visual data for tower representation
     */
    createVisualData(character) {
        const equipment = character.equipment;
        
        return {
            characterName: character.name,
            equipment: {
                weapon: equipment.weapon?.icon || null,
                armor: equipment.armor?.icon || null,
                helmet: equipment.helmet?.icon || null,
                accessory: equipment.accessory?.icon || null
            },
            displayStyle: this.getTowerDisplayStyle(equipment),
            animations: this.getTowerAnimations(equipment)
        };
    }

    getTowerDisplayStyle(equipment) {
        // Determine visual style based on equipment
        if (equipment.weapon?.id.includes('bow')) {
            return 'archer_tower';
        }
        if (equipment.weapon?.id.includes('fire') || equipment.accessory?.id.includes('wings')) {
            return 'magic_tower';
        }
        if (equipment.armor?.id.includes('plate')) {
            return 'fortress_tower';
        }
        return 'standard_tower';
    }

    getTowerAnimations(equipment) {
        const animations = ['idle', 'attack', 'death'];
        
        // Add special animations based on equipment
        if (equipment.accessory?.id.includes('wings')) {
            animations.push('flight');
        }
        if (equipment.weapon?.id.includes('fire')) {
            animations.push('fire_attack');
        }
        
        return animations;
    }

    /**
     * Add special properties based on equipment
     */
    addSpecialProperties(tower, equipment) {
        // Wing properties
        if (equipment.accessory?.id.includes('wings')) {
            tower.canFly = true;
            tower.stats.range *= 1.2;
            tower.abilities.push('air_superiority');
        }

        // Fire weapon properties
        if (equipment.weapon?.name.toLowerCase().includes('fire')) {
            tower.damageType = 'fire';
            tower.abilities.push('burn_damage');
            tower.stats.attack *= 1.1;
        }

        // Plate armor properties
        if (equipment.armor?.id.includes('plate')) {
            tower.armorType = 'heavy';
            tower.stats.defense *= 1.3;
            tower.stats.health *= 1.2;
            tower.abilities.push('damage_reduction');
        }

        // Legendary item bonuses
        Object.values(equipment).forEach(item => {
            if (item?.rarity === 'legendary') {
                tower.stats.attack *= 1.15;
                tower.stats.defense *= 1.15;
                tower.abilities.push('legendary_aura');
            }
        });
    }

    /**
     * Deploy tower to the game field
     */
    deployTower(tower, gamePosition) {
        // Validate deployment
        if (!this.canDeployAt(gamePosition)) {
            throw new Error('Cannot deploy tower at this position');
        }

        // Set position
        tower.position = gamePosition;
        tower.deployedAt = new Date().toISOString();

        // Add to deployed towers
        this.deployedTowers.push(tower);

        // Return deployment data for the game
        return {
            success: true,
            tower: tower,
            position: gamePosition,
            deploymentId: tower.id
        };
    }

    /**
     * Check if a position is valid for tower deployment
     */
    canDeployAt(position) {
        // Basic validation - in a real game this would check the game map
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
            return false;
        }

        // Check if position is already occupied
        return !this.deployedTowers.some(tower => 
            tower.position && 
            tower.position.x === position.x && 
            tower.position.y === position.y
        );
    }

    /**
     * Get all deployed towers
     */
    getDeployedTowers() {
        return [...this.deployedTowers];
    }

    /**
     * Remove tower from deployment
     */
    removeTower(towerId) {
        const index = this.deployedTowers.findIndex(tower => tower.id === towerId);
        if (index > -1) {
            const removedTower = this.deployedTowers.splice(index, 1)[0];
            return {
                success: true,
                tower: removedTower,
                refund: Math.floor(removedTower.deploymentCost * 0.7) // 70% refund
            };
        }
        return { success: false, error: 'Tower not found' };
    }

    /**
     * Generate unique tower ID
     */
    generateTowerId() {
        return 'tower_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Export tower data for Unity integration
     */
    exportForUnity(tower) {
        return {
            TowerData: {
                Id: tower.id,
                Name: tower.characterName,
                Type: tower.towerType,
                Level: tower.level,
                Position: tower.position,
                Stats: {
                    Health: tower.stats.health,
                    Attack: tower.stats.attack,
                    Defense: tower.stats.defense,
                    Range: tower.stats.range,
                    AttackSpeed: tower.stats.attackSpeed,
                    BuildCost: tower.stats.buildCost
                },
                Abilities: tower.abilities,
                VisualData: tower.visualData,
                Equipment: tower.equipment
            }
        };
    }

    /**
     * Save tower configuration for later use
     */
    saveTowerConfiguration(tower, name) {
        const config = {
            name: name,
            characterData: {
                name: tower.characterName,
                equipment: tower.equipment
            },
            towerType: tower.towerType,
            stats: tower.stats,
            abilities: tower.abilities,
            saved: new Date().toISOString()
        };

        // Save to localStorage
        const savedConfigs = JSON.parse(localStorage.getItem('towerConfigurations') || '[]');
        savedConfigs.push(config);
        localStorage.setItem('towerConfigurations', JSON.stringify(savedConfigs));

        return config;
    }

    /**
     * Load saved tower configurations
     */
    getSavedConfigurations() {
        return JSON.parse(localStorage.getItem('towerConfigurations') || '[]');
    }
}

/**
 * Tower stat calculation utility
 */
class TowerStatCalculator {
    constructor() {
        this.baseStats = {
            health: 100,
            attack: 25,
            defense: 15,
            range: 3.0,
            attackSpeed: 1.0
        };
    }

    calculateTowerStats(character, template) {
        const stats = { ...this.baseStats };
        
        // Apply character equipment bonuses
        Object.values(character.equipment).forEach(item => {
            if (item) {
                stats.attack += item.attack || 0;
                stats.defense += item.defense || 0;
            }
        });

        // Apply template multipliers
        stats.attack = Math.floor(stats.attack * template.multipliers.attack);
        stats.defense = Math.floor(stats.defense * template.multipliers.defense);
        stats.health = Math.floor(stats.health * template.multipliers.health);
        stats.range = template.range;
        stats.attackSpeed = template.attackSpeed;

        // Calculate derived stats
        stats.dps = stats.attack * stats.attackSpeed;
        stats.towerValue = (stats.attack + stats.defense + stats.health/10) * 0.15;
        stats.buildCost = Math.max(30, Math.floor(stats.towerValue * 6));
        
        // Apply rarity bonuses
        const rarityBonus = this.calculateRarityBonus(character.equipment);
        if (rarityBonus > 1) {
            stats.attack = Math.floor(stats.attack * rarityBonus);
            stats.defense = Math.floor(stats.defense * rarityBonus);
            stats.buildCost = Math.floor(stats.buildCost * rarityBonus);
        }

        return stats;
    }

    calculateRarityBonus(equipment) {
        let bonus = 1.0;
        
        Object.values(equipment).forEach(item => {
            if (item) {
                switch (item.rarity) {
                    case 'rare':
                        bonus += 0.05;
                        break;
                    case 'epic':
                        bonus += 0.10;
                        break;
                    case 'legendary':
                        bonus += 0.20;
                        break;
                }
            }
        });

        return Math.min(bonus, 1.5); // Cap at 50% bonus
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TowerIntegration, TowerStatCalculator };
} else {
    window.TowerIntegration = TowerIntegration;
    window.TowerStatCalculator = TowerStatCalculator;
}