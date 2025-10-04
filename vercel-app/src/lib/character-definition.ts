/**
 * Character Definition System
 * Based on the JSON structure from starting towers
 */

export interface CharacterExpression {
  Eyebrows: string;
  Eyes: string;
  EyesColor: string;
  Mouth: string;
}

export interface CharacterDefinition {
  // Core appearance
  Body: string; // e.g., "Common.Basic.Body.HumanPants#FFC878FF"
  Ears?: string | null;
  Hair: string; // e.g., "Common.Basic.Hair.Default#429BD0FF"
  Beard?: string | null;
  
  // Equipment layers
  Helmet: string;
  Armor: string; // Can be comma-separated list for multiple layers
  Back?: string | null;
  Wings?: string | null;
  Shield?: string | null;
  Makeup?: string | null;
  Mask?: string | null;
  Earrings?: string | null;
  
  // Weapons
  WeaponType: 'Paired' | 'Melee1H' | 'Melee2H' | 'Ranged' | 'Magic';
  PrimaryWeapon?: string;
  SecondaryWeapon?: string;
  
  // Expressions
  Expression: 'Default' | 'Angry' | 'Dead' | 'Happy';
  'Expression.Default.Eyebrows': string;
  'Expression.Default.Eyes': string;
  'Expression.Default.EyesColor': string;
  'Expression.Default.Mouth': string;
  'Expression.Angry.Eyebrows': string;
  'Expression.Angry.Eyes': string;
  'Expression.Angry.EyesColor': string;
  'Expression.Angry.Mouth': string;
  'Expression.Dead.Eyebrows': string;
  'Expression.Dead.Eyes': string;
  'Expression.Dead.EyesColor': string;
  'Expression.Dead.Mouth': string;
  'Expression.Happy.Eyebrows': string;
  'Expression.Happy.Eyes': string;
  'Expression.Happy.EyesColor': string;
  'Expression.Happy.Mouth': string;
  
  // Special properties
  EquipmentTags: string; // e.g., "HideEars"
  
  // Game stats (not in original JSON but needed for gameplay)
  stats?: {
    health: number;
    damage: number;
    range: number;
    attackSpeed: number;
    defense: number;
    cost: number;
  };
}

export interface ParsedCharacterPart {
  name: string;
  color?: string;
  category: string;
  subcategory: string;
  item: string;
}

/**
 * Parse a character part string like "Common.Basic.Body.HumanPants#FFC878FF"
 */
export function parseCharacterPart(partString: string): ParsedCharacterPart {
  const [pathPart, colorPart] = partString.split('#');
  const pathSegments = pathPart.split('.');
  
  return {
    name: pathPart,
    color: colorPart ? `#${colorPart}` : undefined,
    category: pathSegments[0] || 'Unknown',
    subcategory: pathSegments[1] || 'Unknown',
    item: pathSegments.slice(2).join('.') || 'Unknown'
  };
}

/**
 * Convert parsed part to sprite path
 */
export function partToSpritePath(part: ParsedCharacterPart): string {
  const basePath = '/assets';
  
  // Map categories to our folder structure
  const categoryMap: Record<string, string> = {
    'Common': 'characters',
    'FantasyHeroes': 'armor',
    'Extensions': 'armor'
  };
  
  const subcategoryMap: Record<string, string> = {
    'Body': 'characters',
    'Hair': 'ui/hair',
    'Armor': 'armor',
    'MeleeWeapon1H': 'weapons/melee',
    'MeleeWeapon2H': 'weapons/melee',
    'Firearm1H': 'weapons/firearm-1h',
    'Eyebrows': 'ui/eyebrows',
    'Eyes': 'ui/eyes',
    'Mouth': 'ui/mouth'
  };
  
  let folder = categoryMap[part.category] || 'characters';
  if (subcategoryMap[part.subcategory]) {
    folder = subcategoryMap[part.subcategory];
  }
  
  // Clean the item name for file system
  const fileName = part.item
    .replace(/\[.*?\]/g, '') // Remove bracketed parts like [ShowEars]
    .replace(/\s+/g, '') // Remove spaces
    .trim();
  
  return `${basePath}/${folder}/${fileName}.png`;
}

/**
 * Get current expression parts
 */
export function getCurrentExpressionParts(character: CharacterDefinition): {
  eyebrows: ParsedCharacterPart;
  eyes: ParsedCharacterPart;
  mouth: ParsedCharacterPart;
  eyesColor: string;
} {
  const expr = character.Expression;
  return {
    eyebrows: parseCharacterPart(character[`Expression.${expr}.Eyebrows`]),
    eyes: parseCharacterPart(character[`Expression.${expr}.Eyes`]),
    mouth: parseCharacterPart(character[`Expression.${expr}.Mouth`]),
    eyesColor: character[`Expression.${expr}.EyesColor`]
  };
}

/**
 * Character rendering layer configuration
 */
export const LAYER_ORDER = [
  'Body',      // 0 - Base layer
  'Armor',     // 1 - Multiple layers possible
  'Helmet',    // 2 - Head protection
  'Hair',      // 3 - Hair (if not hidden by helmet)
  'Beard',     // 4 - Facial hair
  'Eyes',      // 5 - Eyes
  'Eyebrows',  // 6 - Eyebrows  
  'Mouth',     // 7 - Mouth
  'Makeup',    // 8 - Makeup effects
  'Mask',      // 9 - Face masks
  'Ears',      // 10 - Ears (if shown)
  'Earrings',  // 11 - Ear accessories
  'PrimaryWeapon',    // 12 - Main weapon
  'SecondaryWeapon',  // 13 - Off-hand weapon
  'Shield',    // 14 - Shield
  'Back',      // 15 - Back accessories
  'Wings',     // 16 - Wings (highest layer)
];

/**
 * Default starting tower characters
 */
export const STARTING_TOWERS: CharacterDefinition[] = [
  // Character 1 - Mage
  {
    Body: "Common.Basic.Body.HumanPants#FFC878FF",
    Ears: null,
    Hair: "Common.Basic.Hair.Default#429BD0FF",
    Beard: null,
    Helmet: "FantasyHeroes.Basic.Armor.ShadowTunic",
    Armor: "FantasyHeroes.Basic.Armor.MagicianRobe [ShowEars]",
    Back: null,
    Wings: null,
    Shield: null,
    WeaponType: "Paired",
    Expression: "Default",
    EquipmentTags: "HideEars",
    Makeup: null,
    Mask: null,
    Earrings: null,
    SecondaryWeapon: "FantasyHeroes.Basic.Firearm1H.OldFlintlockPistol",
    "Expression.Default.Eyebrows": "Common.Basic.Eyebrows.Eyebrows12",
    "Expression.Default.Eyes": "Common.Emoji.Eyes.ScaredEyes#DBA4CBFF",
    "Expression.Default.EyesColor": "#DBA4CBFF",
    "Expression.Default.Mouth": "Common.Basic.Mouth.Mouth05",
    "Expression.Angry.Eyebrows": "Common.Emoji.Eyebrows.AngryEyebrows",
    "Expression.Angry.Eyes": "Common.Emoji.Eyes.AngryEyes3#DBA4CBFF",
    "Expression.Angry.EyesColor": "#DBA4CBFF",
    "Expression.Angry.Mouth": "Common.Emoji.Mouth.AngryMouth1",
    "Expression.Dead.Eyebrows": "Common.Emoji.Eyebrows.DeadEyebrows1",
    "Expression.Dead.Eyes": "Common.Emoji.Eyes.DeadEyes4#DBA4CBFF",
    "Expression.Dead.EyesColor": "#00C8FFFF",
    "Expression.Dead.Mouth": "Common.Emoji.Mouth.DeadMouth4",
    "Expression.Happy.Eyebrows": "Common.Emoji.Eyebrows.DeadEyebrows1",
    "Expression.Happy.Eyes": "Common.Emoji.Eyes.HappyEyes#DBA4CBFF",
    "Expression.Happy.EyesColor": "#DBA4CBFF",
    "Expression.Happy.Mouth": "Common.Basic.Mouth.Smirk",
    stats: {
      health: 100,
      damage: 25,
      range: 150,
      attackSpeed: 1.5,
      defense: 10,
      cost: 100
    }
  },
  
  // Character 2 - Warrior
  {
    Body: "Common.Basic.Body.HumanPants#FFC878FF",
    Ears: null,
    Hair: "Common.Basic.Hair.Default#5A0631FF",
    Beard: null,
    Helmet: "FantasyHeroes.Basic.Armor.GladiatorArmor",
    Armor: "Extensions.Epic.Armor.Vityaz",
    Back: null,
    Wings: null,
    Shield: null,
    WeaponType: "Melee2H",
    Expression: "Default",
    EquipmentTags: "HideEars",
    Makeup: null,
    Mask: null,
    Earrings: null,
    PrimaryWeapon: "FantasyHeroes.Basic.MeleeWeapon2H.FarmerScythe",
    "Expression.Default.Eyebrows": "Common.Basic.Eyebrows.Eyebrows4",
    "Expression.Default.Eyes": "Common.Basic.Eyes.Type08#E44703FF",
    "Expression.Default.EyesColor": "#E44703FF",
    "Expression.Default.Mouth": "Common.Basic.Mouth.Mouth26 [Paint]",
    "Expression.Angry.Eyebrows": "Common.Emoji.Eyebrows.AngryEyebrows",
    "Expression.Angry.Eyes": "Common.Emoji.Eyes.AngryEyes3#E44703FF",
    "Expression.Angry.EyesColor": "#E44703FF",
    "Expression.Angry.Mouth": "Common.Emoji.Mouth.AngryMouth1",
    "Expression.Dead.Eyebrows": "Common.Emoji.Eyebrows.DeadEyebrows1",
    "Expression.Dead.Eyes": "Common.Emoji.Eyes.DeadEyes4#E44703FF",
    "Expression.Dead.EyesColor": "#00C8FFFF",
    "Expression.Dead.Mouth": "Common.Emoji.Mouth.DeadMouth4",
    "Expression.Happy.Eyebrows": "Common.Emoji.Eyebrows.DeadEyebrows1",
    "Expression.Happy.Eyes": "Common.Emoji.Eyes.HappyEyes#E44703FF",
    "Expression.Happy.EyesColor": "#E44703FF",
    "Expression.Happy.Mouth": "Common.Basic.Mouth.Smirk",
    stats: {
      health: 150,
      damage: 40,
      range: 80,
      attackSpeed: 0.8,
      defense: 25,
      cost: 120
    }
  }
  // TODO: Add Character 3 and 4
];

/**
 * Enemy definitions
 */
export const ENEMY_SPRITES = [
  '5qO1lGZ.png',
  '6uQrW5a.png', 
  '9Prc8Md.png',
  'aAeCnY2.png',
  'EA1g8SP.png',
  'xw2LaIg.png'
];

export interface EnemyDefinition {
  id: string;
  name: string;
  spritePath: string;
  health: number;
  speed: number;
  reward: number;
  armor: number;
}

export const ENEMY_TYPES: EnemyDefinition[] = [
  {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    spritePath: '/assets/enemies/5qO1lGZ.png',
    health: 50,
    speed: 1.2,
    reward: 10,
    armor: 0
  },
  {
    id: 'orc_warrior',
    name: 'Orc Warrior', 
    spritePath: '/assets/enemies/6uQrW5a.png',
    health: 100,
    speed: 0.8,
    reward: 20,
    armor: 5
  },
  {
    id: 'troll_berserker',
    name: 'Troll Berserker',
    spritePath: '/assets/enemies/9Prc8Md.png',
    health: 200,
    speed: 0.6,
    reward: 35,
    armor: 10
  },
  {
    id: 'demon_imp',
    name: 'Demon Imp',
    spritePath: '/assets/enemies/aAeCnY2.png',
    health: 75,
    speed: 1.5,
    reward: 15,
    armor: 2
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    spritePath: '/assets/enemies/EA1g8SP.png',
    health: 120,
    speed: 1.8,
    reward: 30,
    armor: 3
  },
  {
    id: 'bone_dragon',
    name: 'Bone Dragon',
    spritePath: '/assets/enemies/xw2LaIg.png',
    health: 300,
    speed: 0.4,
    reward: 50,
    armor: 15
  }
];