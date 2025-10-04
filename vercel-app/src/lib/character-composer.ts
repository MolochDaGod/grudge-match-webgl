/**
 * Character Composition System
 * Handles assembling characters from multiple sprite layers
 */

import { SpriteData, CharacterLayer, getSpritesByCategory, getSpriteById } from './sprite-renderer';

export interface CharacterComposition {
  id: string;
  name: string;
  base: string; // Character base sprite ID
  armor?: string; // Armor sprite ID
  weapon?: string; // Weapon sprite ID
  features: string[]; // Up to 4 UI feature IDs (eyes, eyebrows, etc.)
  attributes?: {
    strength: number;
    defense: number;
    speed: number;
    intelligence: number;
    temporal: number;
    spatial: number;
    consciousness: number;
    harmony: number;
  };
}

export interface CompositionSlot {
  category: 'character' | 'armor' | 'weapon' | 'ui';
  name: string;
  required: boolean;
  maxCount?: number;
  availableSprites: SpriteData[];
}

/**
 * Character Composer utility class
 */
export class CharacterComposer {
  private static instance: CharacterComposer;
  
  private constructor() {}
  
  static getInstance(): CharacterComposer {
    if (!CharacterComposer.instance) {
      CharacterComposer.instance = new CharacterComposer();
    }
    return CharacterComposer.instance;
  }

  /**
   * Get available composition slots and their options
   */
  getCompositionSlots(): CompositionSlot[] {
    return [
      {
        category: 'character',
        name: 'Base Character',
        required: true,
        maxCount: 1,
        availableSprites: getSpritesByCategory('character')
      },
      {
        category: 'armor',
        name: 'Armor/Clothing',
        required: false,
        maxCount: 1,
        availableSprites: getSpritesByCategory('armor')
      },
      {
        category: 'weapon',
        name: 'Weapon',
        required: false,
        maxCount: 1,
        availableSprites: getSpritesByCategory('weapon')
      },
      {
        category: 'ui',
        name: 'Features (Eyes, Eyebrows, etc.)',
        required: false,
        maxCount: 4,
        availableSprites: getSpritesByCategory('ui')
      }
    ];
  }

  /**
   * Convert composition to character layers for rendering
   */
  compositionToLayers(composition: CharacterComposition): CharacterLayer[] {
    const layers: CharacterLayer[] = [];
    const centerX = 150; // Default center position
    const centerY = 150;

    // Base character (layer 0)
    const baseSprite = getSpriteById(composition.base);
    if (baseSprite) {
      layers.push({
        id: 'base',
        name: 'Base Character',
        layer: 0,
        sprite: baseSprite,
        position: { x: centerX, y: centerY },
        scale: { x: 1, y: 1 },
        rotation: 0,
        visible: true
      });
    }

    // Weapon (layer 1)
    if (composition.weapon) {
      const weaponSprite = getSpriteById(composition.weapon);
      if (weaponSprite) {
        // Position weapon based on type
        let weaponOffset = { x: 20, y: -10 };
        if (weaponSprite.name.toLowerCase().includes('bow')) {
          weaponOffset = { x: -15, y: -5 };
        } else if (weaponSprite.name.toLowerCase().includes('staff')) {
          weaponOffset = { x: 25, y: -30 };
        }

        layers.push({
          id: 'weapon',
          name: 'Weapon',
          layer: 1,
          sprite: weaponSprite,
          position: { x: centerX + weaponOffset.x, y: centerY + weaponOffset.y },
          scale: { x: 1, y: 1 },
          rotation: 0,
          visible: true
        });
      }
    }

    // Armor (layer 2)
    if (composition.armor) {
      const armorSprite = getSpriteById(composition.armor);
      if (armorSprite) {
        layers.push({
          id: 'armor',
          name: 'Armor',
          layer: 2,
          sprite: armorSprite,
          position: { x: centerX, y: centerY },
          scale: { x: 1, y: 1 },
          rotation: 0,
          visible: true
        });
      }
    }

    // UI Features (layers 3-6)
    composition.features.forEach((featureId, index) => {
      const featureSprite = getSpriteById(featureId);
      if (featureSprite && index < 4) {
        let featureOffset = { x: 0, y: -20 }; // Default face position
        
        // Adjust position based on feature type
        if (featureSprite.name.toLowerCase().includes('eye')) {
          featureOffset = { x: 0, y: -25 };
        } else if (featureSprite.name.toLowerCase().includes('eyebrow')) {
          featureOffset = { x: 0, y: -30 };
        }

        layers.push({
          id: `feature_${index}`,
          name: `Feature ${index + 1}`,
          layer: 3 + index,
          sprite: featureSprite,
          position: { x: centerX + featureOffset.x, y: centerY + featureOffset.y },
          scale: { x: 1, y: 1 },
          rotation: 0,
          visible: true
        });
      }
    });

    return layers;
  }

  /**
   * Create a random character composition
   */
  generateRandomComposition(name?: string): CharacterComposition {
    const characters = getSpritesByCategory('character');
    const armors = getSpritesByCategory('armor');
    const weapons = getSpritesByCategory('weapon');
    const uiElements = getSpritesByCategory('ui');

    // Randomly select components
    const baseChar = characters[Math.floor(Math.random() * characters.length)];
    const armor = Math.random() > 0.3 ? armors[Math.floor(Math.random() * armors.length)] : undefined;
    const weapon = Math.random() > 0.2 ? weapons[Math.floor(Math.random() * weapons.length)] : undefined;
    
    // Select up to 4 UI features
    const features: string[] = [];
    const featureCount = Math.floor(Math.random() * 3) + 1; // 1-3 features
    const shuffledUI = [...uiElements].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(featureCount, shuffledUI.length, 4); i++) {
      features.push(shuffledUI[i].id);
    }

    // Generate random attributes
    const attributes = this.generateRandomAttributes();

    return {
      id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name || this.generateRandomName(),
      base: baseChar.id,
      armor: armor?.id,
      weapon: weapon?.id,
      features,
      attributes
    };
  }

  /**
   * Generate random attributes for a character
   */
  private generateRandomAttributes() {
    const total = 120; // Total attribute points
    const attributes = {
      strength: 10,
      defense: 10,
      speed: 10,
      intelligence: 10,
      temporal: 10,
      spatial: 10,
      consciousness: 10,
      harmony: 10
    };

    // Randomly distribute remaining points
    const remaining = total - 80;
    const keys = Object.keys(attributes) as (keyof typeof attributes)[];
    
    for (let i = 0; i < remaining; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      if (attributes[key] < 20) {
        attributes[key]++;
      }
    }

    return attributes;
  }

  /**
   * Generate a random character name
   */
  private generateRandomName(): string {
    const prefixes = ['Mighty', 'Swift', 'Wise', 'Dark', 'Bright', 'Steel', 'Shadow', 'Fire', 'Ice', 'Storm'];
    const roots = ['blade', 'heart', 'fist', 'eye', 'wing', 'claw', 'stone', 'flame', 'frost', 'bolt'];
    const suffixes = ['bane', 'ward', 'guard', 'strike', 'born', 'walker', 'rider', 'slayer', 'keeper', 'bringer'];
    
    const usePrefix = Math.random() > 0.5;
    const useSuffix = Math.random() > 0.5;
    
    let name = roots[Math.floor(Math.random() * roots.length)];
    
    if (usePrefix) {
      name = prefixes[Math.floor(Math.random() * prefixes.length)] + name;
    }
    
    if (useSuffix) {
      name = name + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Validate a character composition
   */
  validateComposition(composition: CharacterComposition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required base character
    if (!composition.base || !getSpriteById(composition.base)) {
      errors.push('Base character is required and must be valid');
    }

    // Check armor validity
    if (composition.armor && !getSpriteById(composition.armor)) {
      errors.push('Selected armor is not valid');
    }

    // Check weapon validity
    if (composition.weapon && !getSpriteById(composition.weapon)) {
      errors.push('Selected weapon is not valid');
    }

    // Check features
    if (composition.features.length > 4) {
      errors.push('Maximum 4 features allowed');
    }

    composition.features.forEach((featureId, index) => {
      if (!getSpriteById(featureId)) {
        errors.push(`Feature ${index + 1} is not valid`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate combat effectiveness from composition and attributes
   */
  calculateCombatStats(composition: CharacterComposition): {
    attackPower: number;
    defense: number;
    speed: number;
    magicPower: number;
    health: number;
    mana: number;
  } {
    const attrs = composition.attributes || {
      strength: 10, defense: 10, speed: 10, intelligence: 10,
      temporal: 10, spatial: 10, consciousness: 10, harmony: 10
    };

    // Base stats from attributes
    let attackPower = attrs.strength * 1.5 + attrs.speed * 0.5;
    let defense = attrs.defense * 2 + attrs.strength * 0.3;
    let speed = attrs.speed * 0.8 + attrs.temporal * 0.2;
    let magicPower = attrs.intelligence * 2 + attrs.consciousness * 0.5;
    let health = 100 + attrs.defense * 10;
    let mana = 50 + attrs.intelligence * 5;

    // Bonuses from equipment
    if (composition.armor) {
      const armorSprite = getSpriteById(composition.armor);
      if (armorSprite) {
        // Heavy armor bonuses
        if (armorSprite.name.toLowerCase().includes('heavy') || 
            armorSprite.name.toLowerCase().includes('plate') ||
            armorSprite.name.toLowerCase().includes('champion')) {
          defense *= 1.3;
          speed *= 0.9;
          health += 50;
        }
        // Light armor bonuses
        else if (armorSprite.name.toLowerCase().includes('leather') ||
                 armorSprite.name.toLowerCase().includes('tunic')) {
          speed *= 1.1;
          defense *= 1.1;
        }
        // Robe bonuses
        else if (armorSprite.name.toLowerCase().includes('robe') ||
                 armorSprite.name.toLowerCase().includes('wizard')) {
          magicPower *= 1.2;
          mana += 30;
        }
      }
    }

    if (composition.weapon) {
      const weaponSprite = getSpriteById(composition.weapon);
      if (weaponSprite) {
        // Bow bonuses
        if (weaponSprite.name.toLowerCase().includes('bow')) {
          attackPower *= 1.2;
          speed *= 1.1;
        }
        // Crossbow bonuses
        else if (weaponSprite.name.toLowerCase().includes('crossbow')) {
          attackPower *= 1.3;
          speed *= 0.95;
        }
        // Firearm bonuses
        else if (weaponSprite.name.toLowerCase().includes('pistol') ||
                 weaponSprite.name.toLowerCase().includes('shotgun')) {
          attackPower *= 1.4;
          speed *= 0.9;
        }
      }
    }

    return {
      attackPower: Math.floor(attackPower),
      defense: Math.floor(defense),
      speed: Math.floor(speed),
      magicPower: Math.floor(magicPower),
      health: Math.floor(health),
      mana: Math.floor(mana)
    };
  }

  /**
   * Clone a composition with modifications
   */
  cloneComposition(original: CharacterComposition, modifications?: Partial<CharacterComposition>): CharacterComposition {
    return {
      ...original,
      id: `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Always generate new ID
      ...modifications
    };
  }
}