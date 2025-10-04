export interface Tower {
  id: string;
  characterId?: string; // Link to Character4D
  name: string;
  type: TowerType;
  level: number;
  position: { x: number; y: number };
  stats: TowerStats;
  abilities: TowerAbility[];
  visualData: TowerVisualData;
  nftData?: {
    mintAddress?: string;
    tokenId?: string;
    metadata?: string;
  };
  upgrades: TowerUpgrade[];
  cost: number;
}

export interface TowerStats {
  damage: number;
  range: number;
  fireRate: number; // attacks per second
  piercing: number; // how many enemies a projectile can hit
  criticalChance: number;
  criticalMultiplier: number;
  
  // 4D attributes mapped from character
  temporalPower: number; // affects time-based abilities
  spatialReach: number; // affects range and area abilities
  consciousnessAura: number; // affects buff/debuff abilities
  harmonicResonance: number; // affects chain/combo abilities
}

export interface TowerVisualData {
  modelType: '3d' | 'sprite';
  baseColor: string;
  accentColor: string;
  effectColor: string;
  
  // 3D model data
  geometry?: {
    baseShape: 'cylinder' | 'cube' | 'sphere' | 'custom';
    height: number;
    radius: number;
    segments: number;
  };
  
  // Animation states
  animations: {
    idle: AnimationData;
    attacking: AnimationData;
    upgrading: AnimationData;
    destroyed: AnimationData;
  };
  
  // Particle effects
  particles: {
    muzzleFlash?: ParticleEffect;
    projectileTrail?: ParticleEffect;
    impactEffect?: ParticleEffect;
    auraEffect?: ParticleEffect;
  };
}

export interface AnimationData {
  duration: number;
  keyframes: Array<{
    time: number;
    rotation?: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
    position?: { x: number; y: number; z: number };
  }>;
}

export interface ParticleEffect {
  type: 'spark' | 'smoke' | 'energy' | 'magic';
  count: number;
  color: string;
  lifetime: number;
  speed: { min: number; max: number };
  size: { min: number; max: number };
}

export interface TowerAbility {
  id: string;
  name: string;
  type: AbilityType;
  cooldown: number;
  lastUsed: number;
  effect: AbilityEffect;
  visualEffect?: string;
}

export interface AbilityEffect {
  type: 'damage' | 'slow' | 'freeze' | 'burn' | 'chain' | 'area' | 'buff' | 'debuff';
  value: number;
  duration?: number;
  radius?: number;
  target: 'enemy' | 'self' | 'nearby_towers' | 'area';
}

export interface TowerUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  cost: number;
  gbuxCost?: number;
  requirements?: {
    towerLevel: number;
    previousUpgrades?: string[];
  };
  effects: {
    statModifiers: Partial<TowerStats>;
    newAbilities?: TowerAbility[];
    visualChanges?: Partial<TowerVisualData>;
  };
  nftMintable: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  position: { x: number; y: number };
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  stats: EnemyStats;
  status: EnemyStatus[];
  visualData: EnemyVisualData;
  reward: {
    gold: number;
    experience: number;
    dropChance?: {
      item: string;
      chance: number;
    };
  };
}

export interface EnemyStats {
  maxHealth: number;
  currentHealth: number;
  speed: number;
  armor: number;
  magicResistance: number;
  
  // Special properties
  flying: boolean;
  invisible: boolean;
  boss: boolean;
  shielded: boolean;
}

export interface EnemyStatus {
  type: 'slow' | 'freeze' | 'burn' | 'poison' | 'stun';
  duration: number;
  value: number;
  source: string; // tower id that applied this status
}

export interface EnemyVisualData {
  sprite: string;
  size: { width: number; height: number };
  color: string;
  animations: {
    walking: AnimationData;
    hurt: AnimationData;
    death: AnimationData;
  };
  statusEffects: {
    [key: string]: ParticleEffect;
  };
}

export interface GameWave {
  id: number;
  enemies: Array<{
    type: EnemyType;
    count: number;
    spawnDelay: number; // seconds between spawns
    startTime: number; // when to start spawning this enemy type
  }>;
  reward: {
    gold: number;
    experience: number;
  };
}

export interface GameMap {
  id: string;
  name: string;
  description: string;
  size: { width: number; height: number };
  tileSize: number;
  
  // Path definition
  path: Array<{ x: number; y: number }>;
  
  // Tower placement grid
  buildableAreas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  
  // Visual data
  background: string;
  obstacles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: string;
  }>;
  
  // Waves configuration
  waves: GameWave[];
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWave: number;
  waveProgress: number;
  enemiesRemaining: number;
  
  // Player resources
  health: number;
  maxHealth: number;
  gold: number;
  experience: number;
  score: number;
  
  // Game objects
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  
  // Selected objects
  selectedTower?: Tower;
  hoveredTile?: { x: number; y: number };
  
  // Game map
  currentMap: GameMap;
  
  // Time management
  gameSpeed: number;
  lastUpdate: number;
}

export interface Projectile {
  id: string;
  sourceId: string; // tower id
  targetId?: string; // enemy id
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  damage: number;
  piercing: number;
  effects: AbilityEffect[];
  visualData: {
    sprite: string;
    color: string;
    size: number;
    trail?: ParticleEffect;
  };
}

// Enums
export enum TowerType {
  ARCHER = 'archer',
  MAGE = 'mage',
  WARRIOR = 'warrior',
  SUPPORT = 'support',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  CONSCIOUSNESS = 'consciousness',
  HARMONY = 'harmony'
}

export enum AbilityType {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  TRIGGERED = 'triggered'
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  HEAVY = 'heavy',
  FLYING = 'flying',
  MAGICAL = 'magical',
  BOSS = 'boss',
  DIMENSIONAL = 'dimensional'
}

// Character to Tower conversion helpers
export interface CharacterToTowerMapping {
  baseType: TowerType;
  statMultipliers: {
    strength: keyof TowerStats;
    defense: keyof TowerStats;
    speed: keyof TowerStats;
    intelligence: keyof TowerStats;
    temporal: keyof TowerStats;
    spatial: keyof TowerStats;
    consciousness: keyof TowerStats;
    harmony: keyof TowerStats;
  };
  visualMapping: {
    bodyType: string;
    colorScheme: string[];
  };
}