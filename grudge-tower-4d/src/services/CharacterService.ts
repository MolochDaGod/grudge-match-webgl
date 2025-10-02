import {
  Character4D,
  CharacterAttributes,
  CharacterAppearance,
  CharacterRarity,
  CHARACTER_CONSTRAINTS,
  RARITY_THRESHOLDS,
  TowerConfiguration,
  TowerSegment,
} from '@/types/Character';

export class CharacterService {
  private static readonly STORAGE_KEY = 'grudge_tower_characters';

  /**
   * Create a new character with default values
   */
  static createNewCharacter(
    name: string,
    attributes: CharacterAttributes,
    appearance: CharacterAppearance,
    backstory?: string
  ): Character4D {
    const id = this.generateCharacterId();
    const now = new Date();
    const rarity = this.calculateRarity(attributes);

    return {
      id,
      name,
      attributes,
      appearance,
      metadata: {
        version: '1.0.0',
        mintCost: this.calculateMintCost(attributes),
        rarity,
        backstory: backstory || '',
      },
      createdAt: now,
      lastModified: now,
    };
  }

  /**
   * Validate character attributes
   */
  static validateAttributes(attributes: CharacterAttributes): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check individual attribute bounds
    Object.entries(attributes).forEach(([key, value]) => {
      if (value < CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN || value > CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX) {
        errors.push(`${key} must be between ${CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN} and ${CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX}`);
      }
    });

    // Check total points don't exceed maximum (20 * 8 = 160 max)
    const totalPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
    if (totalPoints > CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX * 8) {
      errors.push(`Total attribute points (${totalPoints}) exceed maximum allowed (${CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX * 8})`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate character rarity based on total attribute points
   */
  static calculateRarity(attributes: CharacterAttributes): CharacterRarity {
    const totalPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);

    for (const [rarity, threshold] of Object.entries(RARITY_THRESHOLDS)) {
      if (totalPoints >= threshold.min && totalPoints <= threshold.max) {
        return rarity as CharacterRarity;
      }
    }

    return 'common'; // Fallback
  }

  /**
   * Calculate mint cost based on attributes and rarity
   */
  static calculateMintCost(attributes: CharacterAttributes): number {
    const baseCost = 100; // Base GBUX cost
    const totalPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
    
    // Exponential scaling for higher attribute totals
    const pointsAboveBase = Math.max(0, totalPoints - CHARACTER_CONSTRAINTS.STARTING_POINTS);
    const multiplier = Math.pow(1.15, pointsAboveBase);
    
    return Math.ceil(baseCost * multiplier);
  }

  /**
   * Convert character to tower configuration for game integration
   */
  static characterToTower(character: Character4D): TowerConfiguration {
    const { attributes } = character;
    const segments: TowerSegment[] = [];

    // Foundation segment (always present)
    segments.push({
      level: 0,
      type: 'foundation',
      attributes: {
        stability: Math.ceil((attributes.defense + attributes.harmony) / 2),
        capacity: Math.ceil((attributes.strength + attributes.spatial) / 2),
      },
      visualEffects: [character.appearance.primaryColor],
    });

    // Living segment (character consciousness)
    segments.push({
      level: 1,
      type: 'living',
      attributes: {
        awareness: attributes.consciousness,
        adaptation: attributes.intelligence,
        growth: Math.ceil((attributes.temporal + attributes.harmony) / 2),
      },
      visualEffects: character.appearance.consciousnessGlow ? ['consciousness_glow'] : [],
    });

    // Combat segment (if strong combat attributes)
    if (attributes.strength + attributes.speed > 25) {
      segments.push({
        level: 2,
        type: 'combat',
        attributes: {
          damage: attributes.strength,
          attackSpeed: attributes.speed,
          accuracy: attributes.intelligence,
        },
        visualEffects: [character.appearance.secondaryColor],
      });
    }

    // Energy segment (if strong mental attributes)
    if (attributes.intelligence + attributes.consciousness > 25) {
      segments.push({
        level: segments.length,
        type: 'energy',
        attributes: {
          generation: attributes.intelligence,
          efficiency: attributes.consciousness,
          storage: attributes.harmony,
        },
        visualEffects: character.appearance.consciousnessGlow ? ['energy_flow'] : [],
      });
    }

    // Temporal segment (if high temporal attribute)
    if (attributes.temporal > 15) {
      segments.push({
        level: segments.length,
        type: 'temporal',
        attributes: {
          timeManipulation: attributes.temporal,
          prediction: Math.ceil((attributes.consciousness + attributes.temporal) / 2),
        },
        visualEffects: character.appearance.temporalTrail ? ['temporal_trail'] : [],
      });
    }

    // Dimensional segment (if high spatial attribute)
    if (attributes.spatial > 15) {
      segments.push({
        level: segments.length,
        type: 'dimensional',
        attributes: {
          phaseShift: attributes.spatial,
          distortion: Math.ceil(character.appearance.spatialDistortion / 5),
        },
        visualEffects: [`dimensional_${character.appearance.dimensionalAura}`],
      });
    }

    return {
      baseHeight: Math.ceil((attributes.defense + attributes.harmony) / 2) * 10,
      baseRadius: Math.ceil((attributes.strength + attributes.spatial) / 2) * 2,
      segments,
      defenseCapacity: Math.ceil((attributes.defense + attributes.intelligence) * 10),
      energyGeneration: Math.ceil((attributes.intelligence + attributes.consciousness) * 5),
      specialAbilities: this.generateSpecialAbilities(attributes),
    };
  }

  /**
   * Generate special abilities based on character attributes
   */
  static generateSpecialAbilities(attributes: CharacterAttributes): string[] {
    const abilities: string[] = [];

    if (attributes.temporal > 16) abilities.push('time_dilation');
    if (attributes.spatial > 16) abilities.push('dimensional_shift');
    if (attributes.consciousness > 16) abilities.push('predictive_analysis');
    if (attributes.harmony > 16) abilities.push('resonance_amplification');
    if (attributes.strength > 17) abilities.push('kinetic_overload');
    if (attributes.defense > 17) abilities.push('adaptive_shielding');
    if (attributes.speed > 17) abilities.push('velocity_burst');
    if (attributes.intelligence > 17) abilities.push('neural_enhancement');

    // Combination abilities
    if (attributes.temporal + attributes.spatial > 35) abilities.push('spacetime_manipulation');
    if (attributes.consciousness + attributes.harmony > 35) abilities.push('unified_field_control');
    if (attributes.strength + attributes.speed > 35) abilities.push('berserker_mode');
    if (attributes.defense + attributes.intelligence > 35) abilities.push('fortress_protocol');

    return abilities;
  }

  /**
   * Save character to local storage
   */
  static saveCharacter(character: Character4D): void {
    const characters = this.getAllCharacters();
    const existingIndex = characters.findIndex(c => c.id === character.id);

    if (existingIndex >= 0) {
      characters[existingIndex] = { ...character, lastModified: new Date() };
    } else {
      characters.push(character);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(characters));
  }

  /**
   * Get all characters from local storage
   */
  static getAllCharacters(): Character4D[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const characters = JSON.parse(stored);
      return characters.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastModified: new Date(c.lastModified),
      }));
    } catch (error) {
      console.error('Error loading characters:', error);
      return [];
    }
  }

  /**
   * Get character by ID
   */
  static getCharacterById(id: string): Character4D | null {
    const characters = this.getAllCharacters();
    return characters.find(c => c.id === id) || null;
  }

  /**
   * Delete character
   */
  static deleteCharacter(id: string): boolean {
    const characters = this.getAllCharacters();
    const filteredCharacters = characters.filter(c => c.id !== id);

    if (filteredCharacters.length < characters.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCharacters));
      return true;
    }

    return false;
  }

  /**
   * Export character data for game integration
   */
  static exportCharacterForGame(character: Character4D): string {
    const gameData = {
      id: character.id,
      name: character.name,
      attributes: character.attributes,
      tower: this.characterToTower(character),
      appearance: character.appearance,
      specialAbilities: this.generateSpecialAbilities(character.attributes),
      rarity: character.metadata.rarity,
    };

    return JSON.stringify(gameData, null, 2);
  }

  /**
   * Generate unique character ID
   */
  private static generateCharacterId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get character presets for quick creation
   */
  static getPresets() {
    return [
      {
        name: 'Temporal Guardian',
        description: 'Master of time manipulation and defensive strategies',
        attributes: {
          strength: 12,
          defense: 16,
          speed: 10,
          intelligence: 14,
          temporal: 18,
          spatial: 8,
          consciousness: 15,
          harmony: 12,
        },
        appearance: {
          bodyType: 'athletic' as const,
          primaryColor: '#4A90E2',
          secondaryColor: '#7B68EE',
          accentColor: '#FFD700',
          dimensionalAura: 'pulsing' as const,
          temporalTrail: true,
          spatialDistortion: 30,
          consciousnessGlow: true,
        },
        suggestedBackstory: 'A being who learned to perceive time as a flowing river, capable of creating temporal eddies and currents to protect their domain.',
      },
      {
        name: 'Spatial Warrior',
        description: 'Aggressive fighter with dimensional mobility',
        attributes: {
          strength: 17,
          defense: 12,
          speed: 16,
          intelligence: 10,
          temporal: 8,
          spatial: 19,
          consciousness: 11,
          harmony: 9,
        },
        appearance: {
          bodyType: 'bulky' as const,
          primaryColor: '#FF4444',
          secondaryColor: '#8B0000',
          accentColor: '#FFA500',
          dimensionalAura: 'fractal' as const,
          temporalTrail: false,
          spatialDistortion: 70,
          consciousnessGlow: false,
        },
        suggestedBackstory: 'A warrior who tears through dimensional barriers, using spatial distortion as both weapon and shield in endless battles.',
      },
      {
        name: 'Harmony Oracle',
        description: 'Balanced entity with enhanced consciousness',
        attributes: {
          strength: 11,
          defense: 13,
          speed: 12,
          intelligence: 16,
          temporal: 14,
          spatial: 13,
          consciousness: 18,
          harmony: 17,
        },
        appearance: {
          bodyType: 'ethereal' as const,
          primaryColor: '#98FB98',
          secondaryColor: '#20B2AA',
          accentColor: '#F0E68C',
          dimensionalAura: 'stable' as const,
          temporalTrail: true,
          spatialDistortion: 15,
          consciousnessGlow: true,
        },
        suggestedBackstory: 'An enlightened being who achieved perfect balance between all dimensions, serving as a beacon of wisdom and harmony.',
      },
    ];
  }
}