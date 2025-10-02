export interface Character4D {
  id: string;
  name: string;
  attributes: CharacterAttributes;
  appearance: CharacterAppearance;
  metadata: CharacterMetadata;
  gameData?: GameIntegrationData;
  createdAt: Date;
  lastModified: Date;
}

export interface CharacterAttributes {
  strength: number; // 1-20, affects damage and physical abilities
  defense: number; // 1-20, affects health and damage resistance
  speed: number; // 1-20, affects movement and attack speed
  intelligence: number; // 1-20, affects special abilities and resource generation
  
  // 4D specific attributes
  temporal: number; // 1-20, affects time-based abilities
  spatial: number; // 1-20, affects dimensional movement
  consciousness: number; // 1-20, affects awareness and prediction
  harmony: number; // 1-20, affects balance and synchronization
}

export interface CharacterAppearance {
  bodyType: 'slim' | 'athletic' | 'bulky' | 'ethereal';
  primaryColor: string; // Hex color
  secondaryColor: string; // Hex color
  accentColor: string; // Hex color
  
  // 4D visual effects
  dimensionalAura: 'stable' | 'shifting' | 'pulsing' | 'fractal';
  temporalTrail: boolean;
  spatialDistortion: number; // 0-100 intensity
  consciousnessGlow: boolean;
}

export interface CharacterMetadata {
  version: string;
  mintCost: number; // GBUX cost to mint
  mintTxHash?: string; // Blockchain transaction hash
  nftAddress?: string; // If minted as NFT
  rarity: CharacterRarity;
  backstory: string;
}

export interface GameIntegrationData {
  towerForm: TowerConfiguration;
  gameStats: GameStats;
  achievements: Achievement[];
}

export interface TowerConfiguration {
  baseHeight: number;
  baseRadius: number;
  segments: TowerSegment[];
  defenseCapacity: number;
  energyGeneration: number;
  specialAbilities: string[];
}

export interface TowerSegment {
  level: number;
  type: 'foundation' | 'living' | 'combat' | 'energy' | 'temporal' | 'dimensional';
  attributes: Record<string, number>;
  visualEffects: string[];
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  averageScore: number;
  highScore: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  specialAbilitiesUsed: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type CharacterRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CharacterPreset {
  name: string;
  description: string;
  attributes: Partial<CharacterAttributes>;
  appearance: Partial<CharacterAppearance>;
  suggestedBackstory: string;
}

// Character creation constraints
export const CHARACTER_CONSTRAINTS = {
  ATTRIBUTE_MIN: 1,
  ATTRIBUTE_MAX: 20,
  STARTING_POINTS: 80, // Total points to distribute across 8 attributes (10 each average)
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 20,
  BACKSTORY_MAX_LENGTH: 500,
} as const;

// Rarity thresholds based on total attribute points
export const RARITY_THRESHOLDS = {
  common: { min: 80, max: 100 },
  uncommon: { min: 101, max: 120 },
  rare: { min: 121, max: 140 },
  epic: { min: 141, max: 160 },
  legendary: { min: 161, max: 180 },
  mythic: { min: 181, max: 200 },
} as const;