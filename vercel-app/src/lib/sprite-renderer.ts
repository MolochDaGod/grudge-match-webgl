/**
 * Sprite Renderer for 4D Character Builder and Tower Defense Game
 * Handles loading, caching, and rendering of sprite assets
 */

export interface SpriteData {
  id: string;
  category: 'character' | 'weapon' | 'armor' | 'enemy' | 'tower' | 'effect' | 'ui' | 'environment';
  name: string;
  path: string;
  width: number;
  height: number;
  frames?: number; // For animated sprites
  layer?: number; // For layered character assembly
}

export interface CharacterLayer {
  id: string;
  name: string;
  layer: number;
  sprite: SpriteData;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  visible: boolean;
}

export class SpriteRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteCache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D rendering context');
    }
    this.ctx = context;
    
    // Set default canvas size
    this.canvas.width = 400;
    this.canvas.height = 400;
  }

  /**
   * Load a sprite image and cache it
   */
  async loadSprite(sprite: SpriteData): Promise<HTMLImageElement> {
    if (this.spriteCache.has(sprite.id)) {
      return this.spriteCache.get(sprite.id)!;
    }

    if (this.loadingPromises.has(sprite.id)) {
      return this.loadingPromises.get(sprite.id)!;
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.spriteCache.set(sprite.id, img);
        this.loadingPromises.delete(sprite.id);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingPromises.delete(sprite.id);
        console.warn(`Failed to load sprite: ${sprite.path}`);
        // Create a fallback colored rectangle
        const fallbackImg = this.createFallbackSprite(sprite);
        this.spriteCache.set(sprite.id, fallbackImg);
        resolve(fallbackImg);
      };

      img.src = sprite.path;
    });

    this.loadingPromises.set(sprite.id, loadPromise);
    return loadPromise;
  }

  /**
   * Create a fallback sprite when image loading fails
   */
  private createFallbackSprite(sprite: SpriteData): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = sprite.width || 64;
    canvas.height = sprite.height || 64;
    const ctx = canvas.getContext('2d')!;

    // Create different colors based on category
    const colors: Record<string, string> = {
      character: '#4ade80',
      weapon: '#ef4444',
      armor: '#3b82f6',
      enemy: '#dc2626',
      tower: '#8b5cf6',
      effect: '#f59e0b',
      ui: '#6b7280',
      environment: '#10b981'
    };

    ctx.fillStyle = colors[sprite.category] || '#9ca3af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    // Add text label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(sprite.name.substring(0, 8), canvas.width / 2, canvas.height / 2);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render a single sprite
   */
  async renderSprite(
    sprite: SpriteData,
    x: number,
    y: number,
    options: {
      scale?: { x: number; y: number };
      rotation?: number;
      alpha?: number;
      frame?: number;
    } = {}
  ): Promise<void> {
    const img = await this.loadSprite(sprite);
    const { scale = { x: 1, y: 1 }, rotation = 0, alpha = 1, frame = 0 } = options;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    
    // Apply transformations
    this.ctx.translate(x, y);
    if (rotation !== 0) {
      this.ctx.rotate(rotation);
    }
    this.ctx.scale(scale.x, scale.y);

    // Calculate source rectangle for animation frames
    const frameWidth = img.width / (sprite.frames || 1);
    const sourceX = frame * frameWidth;

    this.ctx.drawImage(
      img,
      sourceX, 0, frameWidth, img.height,
      -frameWidth / 2, -img.height / 2, frameWidth, img.height
    );

    this.ctx.restore();
  }

  /**
   * Render a layered character from multiple sprites
   */
  async renderCharacter(layers: CharacterLayer[]): Promise<void> {
    this.clear();
    
    // Sort layers by layer number
    const sortedLayers = [...layers]
      .filter(layer => layer.visible)
      .sort((a, b) => a.layer - b.layer);

    for (const layer of sortedLayers) {
      await this.renderSprite(layer.sprite, layer.position.x, layer.position.y, {
        scale: layer.scale,
        rotation: layer.rotation,
      });
    }
  }

  /**
   * Export character as data URL for NFT or storage
   */
  async exportCharacter(layers: CharacterLayer[]): Promise<string> {
    await this.renderCharacter(layers);
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Resize the canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }
}

/**
 * Comprehensive sprite catalog with real assets
 */
export const SPRITE_CATALOG: SpriteData[] = [
  // Base Character Bodies
  {
    id: 'char_human',
    category: 'character',
    name: 'Human',
    path: '/assets/characters/Human.png',
    width: 64,
    height: 64,
    layer: 0
  },
  {
    id: 'char_orc1',
    category: 'character',
    name: 'Orc Warrior',
    path: '/assets/characters/Orc1.png',
    width: 64,
    height: 64,
    layer: 0
  },
  {
    id: 'char_orc2',
    category: 'character',
    name: 'Orc Berserker',
    path: '/assets/characters/Orc2.png',
    width: 64,
    height: 64,
    layer: 0
  },
  {
    id: 'char_demon1',
    category: 'character',
    name: 'Lesser Demon',
    path: '/assets/characters/Demon1.png',
    width: 64,
    height: 64,
    layer: 0
  },
  {
    id: 'char_demon2',
    category: 'character',
    name: 'Greater Demon',
    path: '/assets/characters/Demon2.png',
    width: 64,
    height: 64,
    layer: 0
  },

  // Bows
  {
    id: 'weapon_battle_bow',
    category: 'weapon',
    name: 'Battle Bow',
    path: '/assets/weapons/bow/BattleBow.png',
    width: 32,
    height: 32,
    layer: 1
  },
  {
    id: 'weapon_hunter_bow',
    category: 'weapon',
    name: 'Hunter Bow',
    path: '/assets/weapons/bow/HunterBow.png',
    width: 32,
    height: 32,
    layer: 1
  },
  {
    id: 'weapon_long_bow',
    category: 'weapon',
    name: 'Long Bow',
    path: '/assets/weapons/bow/LongBow.png',
    width: 32,
    height: 32,
    layer: 1
  },
  {
    id: 'weapon_sniper_bow',
    category: 'weapon',
    name: 'Sniper Bow',
    path: '/assets/weapons/bow/SniperBow.png',
    width: 32,
    height: 32,
    layer: 1
  },

  // Crossbows
  {
    id: 'weapon_crossbow',
    category: 'weapon',
    name: 'Crossbow',
    path: '/assets/weapons/crossbow/SmallCrossbow.png',
    width: 32,
    height: 32,
    layer: 1
  },
  {
    id: 'weapon_sniper_crossbow',
    category: 'weapon',
    name: 'Sniper Crossbow',
    path: '/assets/weapons/crossbow/SniperCrossbow.png',
    width: 32,
    height: 32,
    layer: 1
  },

  // Firearms
  {
    id: 'weapon_pistol',
    category: 'weapon',
    name: 'Combat Pistol',
    path: '/assets/weapons/firearm-1h/CombatPistol.png',
    width: 32,
    height: 32,
    layer: 1
  },
  {
    id: 'weapon_shotgun',
    category: 'weapon',
    name: 'Shotgun',
    path: '/assets/weapons/firearm-1h/DoubleBarrelledShotgun.png',
    width: 32,
    height: 32,
    layer: 1
  },

  // Armor - Light
  {
    id: 'armor_leather_tunic',
    category: 'armor',
    name: 'Leather Tunic',
    path: '/assets/armor/LeatherTunic.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_archer_tunic',
    category: 'armor',
    name: 'Archer Tunic',
    path: '/assets/armor/ArcherTunic [ShowEars].png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_hunter_vest',
    category: 'armor',
    name: 'Hunter Vest',
    path: '/assets/armor/HunterLightArmor [ShowEars].png',
    width: 64,
    height: 64,
    layer: 2
  },

  // Armor - Medium
  {
    id: 'armor_chainmail',
    category: 'armor',
    name: 'Chainmail',
    path: '/assets/armor/ChainmailLightArmor.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_iron_armor',
    category: 'armor',
    name: 'Iron Armor',
    path: '/assets/armor/IronArmor.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_knight_armor',
    category: 'armor',
    name: 'Knight Armor',
    path: '/assets/armor/KnightArmor.png',
    width: 64,
    height: 64,
    layer: 2
  },

  // Armor - Heavy
  {
    id: 'armor_heavy_steel',
    category: 'armor',
    name: 'Heavy Steel Cuirass',
    path: '/assets/armor/HeavySteelCuirass.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_champion',
    category: 'armor',
    name: 'Champion Armor',
    path: '/assets/armor/ChampionArmor.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_elite_knight',
    category: 'armor',
    name: 'Elite Knight Armor',
    path: '/assets/armor/EliteKnightArmor.png',
    width: 64,
    height: 64,
    layer: 2
  },

  // Robes - Mage armor
  {
    id: 'armor_wizard_robe',
    category: 'armor',
    name: 'Advanced Wizard Robe',
    path: '/assets/armor/AdvancedWizardRobe.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_fire_wizard_robe',
    category: 'armor',
    name: 'Fire Wizard Robe',
    path: '/assets/armor/FireWizardRobe.png',
    width: 64,
    height: 64,
    layer: 2
  },
  {
    id: 'armor_alchemist_clothes',
    category: 'armor',
    name: 'Alchemist Clothes',
    path: '/assets/armor/AlchemistClothes.png',
    width: 64,
    height: 64,
    layer: 2
  },

  // Projectiles/Effects
  {
    id: 'projectile_arrow',
    category: 'effect',
    name: 'Arrow',
    path: '/assets/effects/arrow.png',
    width: 32,
    height: 8,
    frames: 1
  },
  {
    id: 'projectile_bullet',
    category: 'effect',
    name: 'Bullet',
    path: '/assets/effects/bullet.png',
    width: 16,
    height: 16,
    frames: 1
  },
  {
    id: 'projectile_fireball',
    category: 'effect',
    name: 'Fireball',
    path: '/assets/effects/fireball.png',
    width: 32,
    height: 32,
    frames: 1
  },
  {
    id: 'projectile_iceball',
    category: 'effect',
    name: 'Ice Ball',
    path: '/assets/effects/iceball.png',
    width: 32,
    height: 32,
    frames: 1
  },
  {
    id: 'projectile_jolt',
    category: 'effect',
    name: 'Lightning Jolt',
    path: '/assets/effects/jolt.png',
    width: 32,
    height: 32,
    frames: 1
  },
  {
    id: 'projectile_poison',
    category: 'effect',
    name: 'Poison Strike',
    path: '/assets/effects/poison.png',
    width: 32,
    height: 32,
    frames: 1
  },
  {
    id: 'effect_sparkle',
    category: 'effect',
    name: 'Magic Sparkle',
    path: '/assets/effects/sparkle.png',
    width: 24,
    height: 24,
    frames: 4
  },

  // UI Elements - Eyes
  {
    id: 'ui_eyes_boy',
    category: 'ui',
    name: 'Boy Eyes',
    path: '/assets/ui/eyes/Boy.png',
    width: 16,
    height: 8,
    layer: 3
  },
  {
    id: 'ui_eyes_girl',
    category: 'ui',
    name: 'Girl Eyes',
    path: '/assets/ui/eyes/Girl.png',
    width: 16,
    height: 8,
    layer: 3
  },
  {
    id: 'ui_eyes_angry',
    category: 'ui',
    name: 'Angry Eyes',
    path: '/assets/ui/eyes/Angry.png',
    width: 16,
    height: 8,
    layer: 3
  },
  {
    id: 'ui_eyes_evil',
    category: 'ui',
    name: 'Evil Eyes',
    path: '/assets/ui/eyes/Evil.png',
    width: 16,
    height: 8,
    layer: 3
  },

  // UI Elements - Eyebrows
  {
    id: 'ui_eyebrows_default',
    category: 'ui',
    name: 'Default Eyebrows',
    path: '/assets/ui/eyebrows/Default.png',
    width: 16,
    height: 6,
    layer: 4
  },
  {
    id: 'ui_eyebrows_angry',
    category: 'ui',
    name: 'Angry Eyebrows',
    path: '/assets/ui/eyebrows/AngryEyebrows.png',
    width: 16,
    height: 6,
    layer: 4
  },
  {
    id: 'ui_eyebrows_sad',
    category: 'ui',
    name: 'Sad Eyebrows',
    path: '/assets/ui/eyebrows/SadEyebrows.png',
    width: 16,
    height: 6,
    layer: 4
  },
];

/**
 * Helper function to get sprites by category
 */
export function getSpritesByCategory(category: SpriteData['category']): SpriteData[] {
  return SPRITE_CATALOG.filter(sprite => sprite.category === category);
}

/**
 * Helper function to get sprite by id
 */
export function getSpriteById(id: string): SpriteData | undefined {
  return SPRITE_CATALOG.find(sprite => sprite.id === id);
}