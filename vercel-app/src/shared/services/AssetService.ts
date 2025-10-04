import { Character4D } from '@/types/Character';
import { TowerType } from '@/types/TowerDefense';

export interface SpriteAsset {
  id: string;
  name: string;
  category: 'body' | 'head' | 'weapon' | 'armor' | 'accessory' | 'tower' | 'enemy';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  imagePath: string;
  dimensions: { width: number; height: number };
  animationFrames?: number;
  attributes?: {
    strengthBonus?: number;
    defenseBonus?: number;
    speedBonus?: number;
    intelligenceBonus?: number;
    temporalBonus?: number;
    spatialBonus?: number;
    consciousnessBonus?: number;
    harmonyBonus?: number;
  };
}

export class AssetService {
  private static assets: Map<string, SpriteAsset> = new Map();
  private static loaded = false;

  static async initialize() {
    if (this.loaded) return;
    
    // Load all sprite assets
    await this.loadCharacterAssets();
    await this.loadTowerAssets();
    await this.loadEnemyAssets();
    await this.loadAccessoryAssets();
    
    this.loaded = true;
  }

  private static async loadCharacterAssets() {
    const bodyTypes = ['slender', 'athletic', 'muscular', 'stocky', 'ethereal'];
    const rarities: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'> = 
      ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

    for (const bodyType of bodyTypes) {
      for (const rarity of rarities) {
        const asset: SpriteAsset = {
          id: `body_${bodyType}_${rarity}`,
          name: `${bodyType.charAt(0).toUpperCase() + bodyType.slice(1)} Body (${rarity})`,
          category: 'body',
          rarity,
          imagePath: `/sprites/characters/body_${bodyType}_${rarity}.png`,
          dimensions: { width: 64, height: 64 },
          animationFrames: 4
        };
        this.assets.set(asset.id, asset);
      }
    }

    // Head variations
    const headTypes = ['human', 'elven', 'draconic', 'celestial', 'void'];
    for (const headType of headTypes) {
      for (const rarity of rarities) {
        const asset: SpriteAsset = {
          id: `head_${headType}_${rarity}`,
          name: `${headType.charAt(0).toUpperCase() + headType.slice(1)} Head (${rarity})`,
          category: 'head',
          rarity,
          imagePath: `/sprites/characters/head_${headType}_${rarity}.png`,
          dimensions: { width: 32, height: 32 },
          animationFrames: 4
        };
        this.assets.set(asset.id, asset);
      }
    }
  }

  private static async loadTowerAssets() {
    const towerTypes = ['temporal', 'spatial', 'consciousness', 'harmony', 'archer', 'mage', 'warrior', 'support'];
    const levels = [1, 2, 3, 4, 5];

    for (const towerType of towerTypes) {
      for (const level of levels) {
        const asset: SpriteAsset = {
          id: `tower_${towerType}_level${level}`,
          name: `${towerType.charAt(0).toUpperCase() + towerType.slice(1)} Tower L${level}`,
          category: 'tower',
          rarity: level <= 2 ? 'common' : level <= 3 ? 'rare' : level <= 4 ? 'epic' : 'legendary',
          imagePath: `/sprites/towers/${towerType}_level${level}.png`,
          dimensions: { width: 64, height: 64 },
          animationFrames: 8
        };
        this.assets.set(asset.id, asset);
      }
    }
  }

  private static async loadEnemyAssets() {
    const enemyTypes = ['grunt', 'scout', 'brute', 'drone', 'mage', 'commander', 'voidwalker'];
    const variants = ['normal', 'elite', 'boss'];

    for (const enemyType of enemyTypes) {
      for (const variant of variants) {
        const asset: SpriteAsset = {
          id: `enemy_${enemyType}_${variant}`,
          name: `${enemyType.charAt(0).toUpperCase() + enemyType.slice(1)} (${variant})`,
          category: 'enemy',
          rarity: variant === 'normal' ? 'common' : variant === 'elite' ? 'rare' : 'legendary',
          imagePath: `/sprites/enemies/${enemyType}_${variant}.png`,
          dimensions: { width: 48, height: 48 },
          animationFrames: 6
        };
        this.assets.set(asset.id, asset);
      }
    }
  }

  private static async loadAccessoryAssets() {
    const accessories = [
      // Weapons
      { id: 'weapon_temporal_blade', name: 'Temporal Blade', category: 'weapon', rarity: 'epic', 
        attributes: { strengthBonus: 5, temporalBonus: 8, speedBonus: 3 }},
      { id: 'weapon_void_staff', name: 'Void Staff', category: 'weapon', rarity: 'legendary',
        attributes: { intelligenceBonus: 8, consciousnessBonus: 6, temporalBonus: 4 }},
      { id: 'weapon_harmony_bow', name: 'Harmony Bow', category: 'weapon', rarity: 'mythic',
        attributes: { speedBonus: 6, harmonyBonus: 10, spatialBonus: 4 }},
      
      // Armor
      { id: 'armor_dimensional_plate', name: 'Dimensional Plate', category: 'armor', rarity: 'rare',
        attributes: { defenseBonus: 8, spatialBonus: 6, temporalBonus: 2 }},
      { id: 'armor_consciousness_robe', name: 'Consciousness Robe', category: 'armor', rarity: 'epic',
        attributes: { intelligenceBonus: 6, consciousnessBonus: 8, defenseBonus: 3 }},
      
      // Accessories
      { id: 'accessory_time_crystal', name: 'Time Crystal', category: 'accessory', rarity: 'legendary',
        attributes: { temporalBonus: 10, intelligenceBonus: 4 }},
      { id: 'accessory_spatial_ring', name: 'Spatial Ring', category: 'accessory', rarity: 'epic',
        attributes: { spatialBonus: 8, speedBonus: 3 }},
      { id: 'accessory_harmony_pendant', name: 'Harmony Pendant', category: 'accessory', rarity: 'mythic',
        attributes: { harmonyBonus: 12, consciousnessBonus: 5 }}
    ];

    for (const acc of accessories) {
      const asset: SpriteAsset = {
        id: acc.id,
        name: acc.name,
        category: acc.category as any,
        rarity: acc.rarity as any,
        imagePath: `/sprites/accessories/${acc.id}.png`,
        dimensions: { width: 32, height: 32 },
        attributes: acc.attributes
      };
      this.assets.set(asset.id, asset);
    }
  }

  static getAsset(id: string): SpriteAsset | undefined {
    return this.assets.get(id);
  }

  static getAssetsByCategory(category: string): SpriteAsset[] {
    return Array.from(this.assets.values()).filter(asset => asset.category === category);
  }

  static getAssetsByRarity(rarity: string): SpriteAsset[] {
    return Array.from(this.assets.values()).filter(asset => asset.rarity === rarity);
  }

  static generateCharacterSprite(character: Character4D): string {
    // Create a composite sprite key based on character attributes and appearance
    const bodyType = character.appearance.bodyType || 'athletic';
    const rarity = character.metadata.rarity || 'common';
    
    // For now, return the base body sprite - in a full implementation,
    // this would composite multiple sprite layers
    return `/sprites/characters/body_${bodyType}_${rarity}.png`;
  }

  static generateTowerSprite(towerType: TowerType, level: number = 1): string {
    const typeMap = {
      [TowerType.TEMPORAL]: 'temporal',
      [TowerType.SPATIAL]: 'spatial', 
      [TowerType.CONSCIOUSNESS]: 'consciousness',
      [TowerType.HARMONY]: 'harmony',
      [TowerType.ARCHER]: 'archer',
      [TowerType.MAGE]: 'mage',
      [TowerType.WARRIOR]: 'warrior',
      [TowerType.SUPPORT]: 'support'
    };

    const spriteType = typeMap[towerType] || 'archer';
    return `/sprites/towers/${spriteType}_level${Math.min(level, 5)}.png`;
  }

  static createPlaceholderSprites() {
    // In development, create placeholder colored rectangles
    // This would be replaced with actual PNG loading in production
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Create placeholder sprites programmatically
    this.createPlaceholderSprite(canvas, ctx, 64, 64, '#4A90E2', 'character');
    this.createPlaceholderSprite(canvas, ctx, 64, 64, '#FF6B35', 'tower');
    this.createPlaceholderSprite(canvas, ctx, 48, 48, '#DC143C', 'enemy');
  }

  private static createPlaceholderSprite(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    color: string,
    type: string
  ) {
    canvas.width = width;
    canvas.height = height;
    
    // Draw colored rectangle
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Add type text
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type, width / 2, height / 2);
  }

  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // If image fails to load, create a placeholder
        const placeholder = this.createColoredPlaceholder(64, 64, '#999');
        resolve(placeholder);
      };
      img.src = src;
    });
  }

  private static createColoredPlaceholder(width: number, height: number, color: string): HTMLImageElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  static async loadAllSprites(): Promise<Map<string, HTMLImageElement>> {
    const loadedSprites = new Map<string, HTMLImageElement>();
    
    for (const asset of this.assets.values()) {
      try {
        const img = await this.preloadImage(asset.imagePath);
        loadedSprites.set(asset.id, img);
      } catch (error) {
        console.warn(`Failed to load sprite: ${asset.imagePath}`);
      }
    }
    
    return loadedSprites;
  }

  // Equipment layering for character composition
  static layerEquipment(baseSprite: HTMLImageElement, equipment: SpriteAsset[]): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = baseSprite.width;
    canvas.height = baseSprite.height;
    
    // Draw base character
    ctx.drawImage(baseSprite, 0, 0);
    
    // Layer equipment in correct order: armor, weapons, accessories
    const layerOrder = ['armor', 'weapon', 'accessory'];
    
    for (const layer of layerOrder) {
      const layerEquipment = equipment.filter(eq => eq.category === layer);
      for (const item of layerEquipment) {
        // In a full implementation, you'd load and position each equipment sprite
        // For now, we'll just draw colored overlays to represent equipment
        ctx.fillStyle = this.getEquipmentColor(item.rarity);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, 32, 32); // Position based on equipment type
        ctx.globalAlpha = 1;
      }
    }
    
    return canvas;
  }

  private static getEquipmentColor(rarity: string): string {
    const colors = {
      common: '#B0B0B0',
      uncommon: '#4CAF50',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythic: '#F44336'
    };
    return colors[rarity as keyof typeof colors] || '#B0B0B0';
  }
}