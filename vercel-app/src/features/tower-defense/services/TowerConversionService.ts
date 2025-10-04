import { Character4D, CharacterAttributes, CharacterAppearance } from '@/types/Character';
import { 
  Tower, 
  TowerType, 
  TowerStats, 
  TowerVisualData, 
  TowerAbility, 
  AbilityType,
  AnimationData,
  ParticleEffect
} from '@/types/TowerDefense';

export class TowerConversionService {
  /**
   * Converts a Character4D into a Tower for use in the tower defense game
   */
  static convertCharacterToTower(character: Character4D): Tower {
    const towerType = this.determineTowerType(character.attributes);
    const stats = this.convertAttributesToTowerStats(character.attributes, towerType);
    const visualData = this.convertAppearanceToTowerVisuals(character.appearance, towerType);
    const abilities = this.generateTowerAbilities(character.attributes, towerType);

    return {
      id: `tower_${character.id}`,
      characterId: character.id,
      name: character.name,
      type: towerType,
      level: 1,
      position: { x: 0, y: 0 }, // Will be set when placed
      stats,
      abilities,
      visualData,
      upgrades: [],
      cost: this.calculateTowerCost(stats)
    };
  }

  /**
   * Determines the primary tower type based on character attributes
   */
  private static determineTowerType(attributes: CharacterAttributes): TowerType {
    const { strength, defense, speed, intelligence, temporal, spatial, consciousness, harmony } = attributes;
    
    // Find the highest 4D attribute
    const dimensionalStats = { temporal, spatial, consciousness, harmony };
    const highestDimensional = Object.entries(dimensionalStats).reduce((a, b) => 
      dimensionalStats[a[0] as keyof typeof dimensionalStats] > dimensionalStats[b[0] as keyof typeof dimensionalStats] ? a : b
    );

    // Map 4D attributes to tower types
    switch (highestDimensional[0]) {
      case 'temporal':
        return TowerType.TEMPORAL;
      case 'spatial':
        return TowerType.SPATIAL;
      case 'consciousness':
        return TowerType.CONSCIOUSNESS;
      case 'harmony':
        return TowerType.HARMONY;
      default:
        // Fall back to traditional stats
        if (intelligence > Math.max(strength, defense, speed)) return TowerType.MAGE;
        if (strength > Math.max(defense, speed)) return TowerType.ARCHER;
        if (defense > speed) return TowerType.WARRIOR;
        return TowerType.SUPPORT;
    }
  }

  /**
   * Converts character attributes to tower combat stats
   */
  private static convertAttributesToTowerStats(attributes: CharacterAttributes, type: TowerType): TowerStats {
    const { strength, speed, intelligence, temporal, spatial, consciousness, harmony } = attributes;
    
    // Base multipliers for different tower types
    const typeMultipliers = this.getTowerTypeMultipliers(type);
    
    return {
      damage: Math.floor((strength * typeMultipliers.damage) + (intelligence * 0.5)),
      range: Math.floor((spatial * 2) + (intelligence * 0.3) + 50), // Base range of 50
      fireRate: Math.min(5.0, (speed * 0.05) + (temporal * 0.03) + 0.5), // Max 5 attacks/sec
      piercing: Math.floor(spatial / 20) + (type === TowerType.ARCHER ? 1 : 0),
      criticalChance: Math.min(0.5, (speed * 0.01) + (consciousness * 0.005)), // Max 50%
      criticalMultiplier: 1.5 + (strength * 0.02),
      
      // 4D attributes
      temporalPower: temporal,
      spatialReach: spatial,
      consciousnessAura: consciousness,
      harmonicResonance: harmony
    };
  }

  /**
   * Gets stat multipliers based on tower type
   */
  private static getTowerTypeMultipliers(type: TowerType) {
    const multipliers = {
      [TowerType.ARCHER]: { damage: 1.2, range: 1.3, fireRate: 1.1 },
      [TowerType.MAGE]: { damage: 1.5, range: 1.1, fireRate: 0.8 },
      [TowerType.WARRIOR]: { damage: 1.0, range: 0.8, fireRate: 1.3 },
      [TowerType.SUPPORT]: { damage: 0.6, range: 1.2, fireRate: 1.0 },
      [TowerType.TEMPORAL]: { damage: 1.1, range: 1.0, fireRate: 1.4 },
      [TowerType.SPATIAL]: { damage: 1.0, range: 1.5, fireRate: 0.9 },
      [TowerType.CONSCIOUSNESS]: { damage: 0.8, range: 1.2, fireRate: 1.0 },
      [TowerType.HARMONY]: { damage: 0.9, range: 1.1, fireRate: 1.2 }
    };
    
    return multipliers[type];
  }

  /**
   * Converts character appearance to tower visual data
   */
  private static convertAppearanceToTowerVisuals(appearance: CharacterAppearance, type: TowerType): TowerVisualData {
    const baseShapes = {
      [TowerType.ARCHER]: 'cylinder' as const,
      [TowerType.MAGE]: 'sphere' as const,
      [TowerType.WARRIOR]: 'cube' as const,
      [TowerType.SUPPORT]: 'cylinder' as const,
      [TowerType.TEMPORAL]: 'sphere' as const,
      [TowerType.SPATIAL]: 'cube' as const,
      [TowerType.CONSCIOUSNESS]: 'sphere' as const,
      [TowerType.HARMONY]: 'cylinder' as const
    };

    const defaultAnimation: AnimationData = {
      duration: 1000,
      keyframes: [
        { time: 0, rotation: { x: 0, y: 0, z: 0 } },
        { time: 1, rotation: { x: 0, y: 0, z: 0 } }
      ]
    };

    const defaultParticle: ParticleEffect = {
      type: 'energy',
      count: 10,
      color: appearance.accentColor,
      lifetime: 500,
      speed: { min: 1, max: 3 },
      size: { min: 2, max: 5 }
    };

    return {
      modelType: '3d',
      baseColor: appearance.primaryColor,
      accentColor: appearance.secondaryColor,
      effectColor: appearance.accentColor,
      
      geometry: {
        baseShape: baseShapes[type],
        height: this.getBodyTypeHeight(appearance.bodyType),
        radius: this.getBodyTypeRadius(appearance.bodyType),
        segments: 16
      },
      
      animations: {
        idle: {
          ...defaultAnimation,
          keyframes: [
            { time: 0, rotation: { x: 0, y: 0, z: 0 } },
            { time: 0.5, rotation: { x: 0, y: Math.PI / 16, z: 0 } },
            { time: 1, rotation: { x: 0, y: 0, z: 0 } }
          ]
        },
        attacking: {
          duration: 300,
          keyframes: [
            { time: 0, scale: { x: 1, y: 1, z: 1 } },
            { time: 0.3, scale: { x: 1.1, y: 0.9, z: 1.1 } },
            { time: 1, scale: { x: 1, y: 1, z: 1 } }
          ]
        },
        upgrading: {
          duration: 2000,
          keyframes: [
            { time: 0, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
            { time: 0.5, rotation: { x: 0, y: Math.PI, z: 0 }, scale: { x: 1.2, y: 1.2, z: 1.2 } },
            { time: 1, rotation: { x: 0, y: Math.PI * 2, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
          ]
        },
        destroyed: {
          duration: 1000,
          keyframes: [
            { time: 0, scale: { x: 1, y: 1, z: 1 } },
            { time: 1, scale: { x: 0, y: 0, z: 0 } }
          ]
        }
      },
      
      particles: {
        muzzleFlash: { ...defaultParticle, type: 'spark', count: 5, lifetime: 200 },
        projectileTrail: { ...defaultParticle, type: 'energy', count: 3, lifetime: 300 },
        auraEffect: appearance.consciousnessGlow ? {
          ...defaultParticle,
          type: 'energy',
          count: 20,
          lifetime: 1000,
          color: appearance.accentColor
        } : undefined
      }
    };
  }

  /**
   * Gets tower height based on character body type
   */
  private static getBodyTypeHeight(bodyType: string): number {
    const heights = {
      'slender': 40,
      'athletic': 50,
      'muscular': 60,
      'stocky': 45,
      'ethereal': 55
    };
    return heights[bodyType as keyof typeof heights] || 50;
  }

  /**
   * Gets tower radius based on character body type
   */
  private static getBodyTypeRadius(bodyType: string): number {
    const radii = {
      'slender': 15,
      'athletic': 20,
      'muscular': 25,
      'stocky': 22,
      'ethereal': 18
    };
    return radii[bodyType as keyof typeof radii] || 20;
  }

  /**
   * Generates tower abilities based on character attributes and type
   */
  private static generateTowerAbilities(attributes: CharacterAttributes, type: TowerType): TowerAbility[] {
    const abilities: TowerAbility[] = [];
    const { temporal, spatial, consciousness, harmony } = attributes;

    // Temporal abilities
    if (temporal > 20) {
      abilities.push({
        id: 'time_slow',
        name: 'Temporal Distortion',
        type: AbilityType.TRIGGERED,
        cooldown: 10000,
        lastUsed: 0,
        effect: {
          type: 'slow',
          value: Math.min(0.8, temporal / 50), // Max 80% slow
          duration: 3000,
          radius: temporal * 2,
          target: 'area'
        },
        visualEffect: 'temporal_wave'
      });
    }

    // Spatial abilities
    if (spatial > 20) {
      abilities.push({
        id: 'spatial_pierce',
        name: 'Dimensional Pierce',
        type: AbilityType.PASSIVE,
        cooldown: 0,
        lastUsed: 0,
        effect: {
          type: 'damage',
          value: spatial / 10,
          target: 'enemy'
        }
      });
    }

    // Consciousness abilities
    if (consciousness > 20) {
      abilities.push({
        id: 'mind_link',
        name: 'Neural Network',
        type: AbilityType.PASSIVE,
        cooldown: 0,
        lastUsed: 0,
        effect: {
          type: 'buff',
          value: consciousness / 100, // Damage multiplier
          radius: consciousness * 1.5,
          target: 'nearby_towers'
        }
      });
    }

    // Harmony abilities
    if (harmony > 20) {
      abilities.push({
        id: 'harmonic_resonance',
        name: 'Chain Lightning',
        type: AbilityType.TRIGGERED,
        cooldown: 8000,
        lastUsed: 0,
        effect: {
          type: 'chain',
          value: harmony / 5,
          duration: 100,
          target: 'enemy'
        },
        visualEffect: 'lightning_chain'
      });
    }

    // Type-specific abilities
    switch (type) {
      case TowerType.ARCHER:
        abilities.push({
          id: 'multi_shot',
          name: 'Multi-Shot',
          type: AbilityType.TRIGGERED,
          cooldown: 5000,
          lastUsed: 0,
          effect: {
            type: 'damage',
            value: attributes.strength * 0.8,
            target: 'area'
          }
        });
        break;
        
      case TowerType.MAGE:
        abilities.push({
          id: 'fireball',
          name: 'Arcane Blast',
          type: AbilityType.TRIGGERED,
          cooldown: 7000,
          lastUsed: 0,
          effect: {
            type: 'area',
            value: attributes.intelligence,
            radius: 50,
            target: 'area'
          }
        });
        break;
    }

    return abilities;
  }

  /**
   * Calculates the base cost of a tower based on its stats
   */
  private static calculateTowerCost(stats: TowerStats): number {
    const baseCost = 100;
    const statValue = (stats.damage * 2) + (stats.range * 0.5) + (stats.fireRate * 20);
    const dimensionalValue = (stats.temporalPower + stats.spatialReach + 
                             stats.consciousnessAura + stats.harmonicResonance) * 0.5;
    
    return Math.floor(baseCost + statValue + dimensionalValue);
  }

  /**
   * Creates a tower export data structure for game integration
   */
  static createTowerExportData(tower: Tower) {
    return {
      id: tower.id,
      name: tower.name,
      type: tower.type,
      characterData: tower.characterId,
      stats: tower.stats,
      abilities: tower.abilities.map(ability => ({
        id: ability.id,
        name: ability.name,
        type: ability.type,
        effect: ability.effect,
        cooldown: ability.cooldown
      })),
      visualPreset: {
        modelType: tower.visualData.modelType,
        colors: {
          base: tower.visualData.baseColor,
          accent: tower.visualData.accentColor,
          effect: tower.visualData.effectColor
        },
        geometry: tower.visualData.geometry,
        particles: tower.visualData.particles
      },
      cost: tower.cost,
      nftData: tower.nftData
    };
  }

  /**
   * Validates that a character can be converted to a tower
   */
  static validateCharacterForTower(character: Character4D): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check minimum attribute requirements
    const totalAttributes = Object.values(character.attributes).reduce((sum, val) => sum + val, 0);
    if (totalAttributes < 80) {
      errors.push('Character needs at least 80 total attribute points');
    }
    
    // Check 4D attributes
    const { temporal, spatial, consciousness, harmony } = character.attributes;
    if (temporal + spatial + consciousness + harmony < 40) {
      errors.push('Character needs at least 40 total 4D attribute points');
    }
    
    // Check name
    if (!character.name.trim()) {
      errors.push('Character must have a name');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}