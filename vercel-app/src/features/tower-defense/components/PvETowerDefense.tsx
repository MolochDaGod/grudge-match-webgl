'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Coins, 
  Heart, 
  Trophy, 
  Zap, 
  Shield, 
  Target, 
  Wind, 
  Flame,
  Snowflake,
  Bolt,
  Skull
} from 'lucide-react';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { AnalyticsService } from '@/shared/utils/analytics';
import { getSpriteById } from '@/lib/sprite-renderer';

// Real monster images from your provided examples
const MONSTER_IMAGES = {
  goblin: 'https://i.imgur.com/Dh99XuH.png',
  orc: 'https://i.imgur.com/NFjvmxO.png',
  troll: 'https://i.imgur.com/Sb0vCNi.png',
  demon: 'https://i.imgur.com/zMFckYB.png',
  dragon: 'https://i.imgur.com/XbSuPyC.png',
  skeleton: 'https://i.imgur.com/3SkE6VG.png',
  zombie: 'https://i.imgur.com/klAa6aX.png',
  wraith: 'https://i.imgur.com/Wn84v6I.png',
  banshee: 'https://i.imgur.com/Y67jKrU.png',
  vampire: 'https://i.imgur.com/Enu1T7Y.png'
};

// Real projectile images
const PROJECTILE_IMAGES = {
  arrow: 'https://i.imgur.com/dU3QrVi.png',
  fire: 'https://i.imgur.com/KjBYZ7L.png',
  ice: 'https://i.imgur.com/lAUM1L7.png',
  lightning: 'https://i.imgur.com/ra2S7o0.png',
  poison: 'https://i.imgur.com/dWpBsru.png'
};

// Tower upgrade visual effects
const TOWER_UPGRADE_EFFECTS = {
  level1: { size: 15, glow: 0, animation: 0 },
  level2: { size: 18, glow: 5, animation: 0.1 },
  level3: { size: 21, glow: 8, animation: 0.2 },
  level4: { size: 24, glow: 12, animation: 0.3 },
  level5: { size: 28, glow: 15, animation: 0.4 }
};

// Tower Types
interface TowerType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // attacks per second
  projectileType: 'arrow' | 'fire' | 'ice' | 'lightning' | 'poison';
  color: string;
  upgrades: {
    damage: number[];
    range: number[];
    fireRate: number[];
    cost: number[];
  };
}

// Enemy Types
interface EnemyType {
  id: string;
  name: string;
  health: number;
  speed: number; // pixels per second
  reward: number;
  color: string;
  resistance?: string; // damage type they resist
}

// Game State
interface GameState {
  wave: number;
  lives: number;
  gold: number;
  score: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameSpeed: number;
  selectedTower: string | null;
}

// Tower Instance
interface Tower {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  lastFire: number;
  target: Enemy | null;
}

// Enemy Instance
interface Enemy {
  id: string;
  type: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  pathIndex: number;
  direction: { x: number; y: number };
  customPath: { x: number; y: number }[];
}

// Projectile
interface Projectile {
  id: string;
  type: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
}

const TOWER_TYPES: Record<string, TowerType> = {
  basic: {
    id: 'basic',
    name: 'Archer Tower',
    icon: Target,
    cost: 15,
    damage: 20,
    range: 80,
    fireRate: 1,
    projectileType: 'arrow',
    color: '#8B4513',
    upgrades: {
      damage: [30, 45, 70, 100],
      range: [90, 100, 110, 120],
      fireRate: [1.2, 1.5, 1.8, 2.2],
      cost: [20, 35, 55, 80]
    }
  },
  fire: {
    id: 'fire',
    name: 'Fire Tower',
    icon: Flame,
    cost: 25,
    damage: 35,
    range: 70,
    fireRate: 0.8,
    projectileType: 'fire',
    color: '#FF4500',
    upgrades: {
      damage: [50, 75, 110, 160],
      range: [80, 90, 100, 110],
      fireRate: [1.0, 1.2, 1.5, 1.8],
      cost: [35, 60, 90, 130]
    }
  },
  ice: {
    id: 'ice',
    name: 'Frost Tower',
    icon: Snowflake,
    cost: 30,
    damage: 25,
    range: 75,
    fireRate: 0.6,
    projectileType: 'ice',
    color: '#00BFFF',
    upgrades: {
      damage: [40, 60, 85, 120],
      range: [85, 95, 105, 115],
      fireRate: [0.8, 1.0, 1.3, 1.6],
      cost: [40, 70, 105, 150]
    }
  },
  lightning: {
    id: 'lightning',
    name: 'Storm Tower',
    icon: Bolt,
    cost: 45,
    damage: 60,
    range: 90,
    fireRate: 0.5,
    projectileType: 'lightning',
    color: '#9370DB',
    upgrades: {
      damage: [90, 135, 200, 300],
      range: [100, 110, 120, 130],
      fireRate: [0.7, 0.9, 1.2, 1.5],
      cost: [65, 110, 170, 250]
    }
  }
};

const ENEMY_TYPES: Record<string, EnemyType & { spriteId?: string; imageUrl?: string }> = {
  goblin: {
    id: 'goblin',
    name: 'Goblin Scout',
    health: 100,
    speed: 50,
    reward: 5,
    color: '#228B22',
    spriteId: 'char_human',
    imageUrl: MONSTER_IMAGES.goblin
  },
  orc: {
    id: 'orc',
    name: 'Orc Warrior',
    health: 200,
    speed: 35,
    reward: 8,
    color: '#8B4513',
    spriteId: 'char_orc1',
    imageUrl: MONSTER_IMAGES.orc
  },
  troll: {
    id: 'troll',
    name: 'Mountain Troll',
    health: 400,
    speed: 25,
    reward: 15,
    color: '#696969',
    spriteId: 'char_orc2',
    imageUrl: MONSTER_IMAGES.troll
  },
  demon: {
    id: 'demon',
    name: 'Fire Demon',
    health: 300,
    speed: 45,
    reward: 12,
    color: '#DC143C',
    resistance: 'fire',
    spriteId: 'char_demon1',
    imageUrl: MONSTER_IMAGES.demon
  },
  dragon: {
    id: 'dragon',
    name: 'Ancient Dragon',
    health: 1000,
    speed: 30,
    reward: 50,
    color: '#4B0082',
    spriteId: 'char_demon2',
    imageUrl: MONSTER_IMAGES.dragon
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton Warrior',
    health: 150,
    speed: 40,
    reward: 6,
    color: '#FFFFFF',
    imageUrl: MONSTER_IMAGES.skeleton
  },
  zombie: {
    id: 'zombie',
    name: 'Undead Zombie',
    health: 180,
    speed: 30,
    reward: 7,
    color: '#90EE90',
    imageUrl: MONSTER_IMAGES.zombie
  },
  wraith: {
    id: 'wraith',
    name: 'Shadow Wraith',
    health: 120,
    speed: 60,
    reward: 8,
    color: '#9370DB',
    imageUrl: MONSTER_IMAGES.wraith
  },
  banshee: {
    id: 'banshee',
    name: 'Wailing Banshee',
    health: 250,
    speed: 55,
    reward: 10,
    color: '#800080',
    imageUrl: MONSTER_IMAGES.banshee
  },
  vampire: {
    id: 'vampire',
    name: 'Blood Vampire',
    health: 350,
    speed: 50,
    reward: 15,
    color: '#8B0000',
    imageUrl: MONSTER_IMAGES.vampire
  }
};

const GRID_SIZE = 40;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;

export default function PvETowerDefense() {
  const { isAuthenticated, user } = useAutoAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    wave: 1,
    lives: 20,
    gold: 100,
    score: 0,
    isPlaying: false,
    isPaused: false,
    gameSpeed: 1,
    selectedTower: null
  });

  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedTowerInstance, setSelectedTowerInstance] = useState<Tower | null>(null);
  const [grid, setGrid] = useState<(Tower | null)[][]>(
    Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null))
  );
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const [animationTime, setAnimationTime] = useState(0);

  // More natural enemy path - enemies spawn in middle but spread out
  const generateEnemyPath = useCallback((startOffset = 0) => {
    const centerX = Math.floor(GRID_WIDTH / 2);
    const path = [];
    
    // Add some randomness to the path while keeping it generally downward
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let x = centerX;
      
      // Add some horizontal variation based on wave progress
      if (y > 2 && y < GRID_HEIGHT - 2) {
        const variation = Math.sin((y + startOffset) * 0.3) * 2;
        x = Math.max(2, Math.min(GRID_WIDTH - 3, centerX + variation));
      }
      
      path.push({ 
        x: x * GRID_SIZE + GRID_SIZE / 2 + Math.random() * 10 - 5,
        y: y * GRID_SIZE + GRID_SIZE / 2 + Math.random() * 5 - 2.5
      });
    }
    
    return path;
  }, []);

  const enemyPath = generateEnemyPath();

  // Preload images
  useEffect(() => {
    const imagesToLoad = {
      ...MONSTER_IMAGES,
      ...PROJECTILE_IMAGES
    };
    
    const imagePromises = Object.entries(imagesToLoad).map(([key, url]) => {
      return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve([key, img]);
        img.onerror = reject;
        img.src = url;
      });
    });
    
    Promise.all(imagePromises)
      .then(results => {
        const imageMap = Object.fromEntries(results);
        setLoadedImages(imageMap);
      })
      .catch(console.error);
  }, []);

  // Animation time update
  useEffect(() => {
    const animationLoop = setInterval(() => {
      setAnimationTime(prev => prev + 0.016);
    }, 16);
    
    return () => clearInterval(animationLoop);
  }, []);

  // Game Loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const gameLoop = setInterval(() => {
      updateGame();
    }, 16 * gameState.gameSpeed); // ~60 FPS adjusted by game speed

    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, gameState.gameSpeed, enemies, projectiles, towers]);

  // Wave Management
  useEffect(() => {
    if (gameState.isPlaying && enemies.length === 0) {
      // Start next wave after delay
      setTimeout(() => {
        spawnWave();
      }, 2000);
    }
  }, [enemies.length, gameState.isPlaying, gameState.wave, spawnWave]);

  const updateGame = useCallback(() => {
    const now = Date.now();
    
    // Update enemies with improved movement
    setEnemies(prev => {
      return prev.map(enemy => {
        const newEnemy = { ...enemy };
        
        // Move enemy along their individual path
        if (newEnemy.pathIndex < enemy.customPath.length - 1) {
          const currentTarget = enemy.customPath[newEnemy.pathIndex + 1];
          const dx = currentTarget.x - newEnemy.x;
          const dy = currentTarget.y - newEnemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 8) {
            newEnemy.pathIndex++;
          } else {
            const enemyType = ENEMY_TYPES[newEnemy.type];
            const moveSpeed = enemyType.speed * 0.016;
            newEnemy.x += (dx / distance) * moveSpeed;
            newEnemy.y += (dy / distance) * moveSpeed;
          }
        } else {
          // Enemy reached the end
          setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
          return null;
        }
        
        return newEnemy;
      }).filter(Boolean) as Enemy[];
    });

    // Update projectiles
    setProjectiles(prev => {
      return prev.map(projectile => {
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          // Projectile hit target - deal damage
          setEnemies(prevEnemies => {
            return prevEnemies.map(enemy => {
              if (Math.abs(enemy.x - projectile.targetX) < 20 && 
                  Math.abs(enemy.y - projectile.targetY) < 20) {
                const newHealth = enemy.health - projectile.damage;
                if (newHealth <= 0) {
                  // Enemy died
                  setGameState(prev => ({
                    ...prev,
                    gold: prev.gold + ENEMY_TYPES[enemy.type].reward,
                    score: prev.score + ENEMY_TYPES[enemy.type].reward * 10
                  }));
                  return null;
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }).filter(Boolean) as Enemy[];
          });
          return null;
        }
        
        return {
          ...projectile,
          x: projectile.x + (dx / distance) * projectile.speed * 0.016,
          y: projectile.y + (dy / distance) * projectile.speed * 0.016
        };
      }).filter(Boolean) as Projectile[];
    });

    // Update towers (targeting and shooting)
    setTowers(prev => {
      return prev.map(tower => {
        const towerType = TOWER_TYPES[tower.type];
        const towerStats = {
          damage: towerType.damage + (tower.level > 0 ? towerType.upgrades.damage[tower.level - 1] : 0),
          range: towerType.range + (tower.level > 0 ? towerType.upgrades.range[tower.level - 1] : 0),
          fireRate: towerType.fireRate + (tower.level > 0 ? towerType.upgrades.fireRate[tower.level - 1] : 0)
        };

        // Find target
        const target = enemies.find(enemy => {
          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          return Math.sqrt(dx * dx + dy * dy) <= towerStats.range;
        });

        const newTower = { ...tower, target };

        // Shoot if target in range and cooldown ready
        if (target && now - tower.lastFire > (1000 / towerStats.fireRate)) {
          setProjectiles(prev => [...prev, {
            id: `proj-${now}-${Math.random()}`,
            type: towerType.projectileType,
            x: tower.x,
            y: tower.y,
            targetX: target.x,
            targetY: target.y,
            damage: towerStats.damage,
            speed: 200
          }]);
          newTower.lastFire = now;
        }

        return newTower;
      });
    });
  }, [enemies, projectiles, towers]);

  const spawnWave = useCallback(() => {
    const wave = gameState.wave;
    let enemiesToSpawn: { type: string; count: number }[] = [];

    // Enhanced wave composition with more variety
    if (wave <= 3) {
      enemiesToSpawn = [{ type: 'goblin', count: 6 + wave * 2 }];
    } else if (wave <= 6) {
      enemiesToSpawn = [
        { type: 'goblin', count: 8 + wave },
        { type: 'skeleton', count: Math.floor(wave / 2) }
      ];
    } else if (wave <= 10) {
      enemiesToSpawn = [
        { type: 'goblin', count: 5 },
        { type: 'skeleton', count: 4 + wave - 6 },
        { type: 'orc', count: Math.floor(wave / 2) }
      ];
    } else if (wave <= 15) {
      enemiesToSpawn = [
        { type: 'orc', count: 8 },
        { type: 'zombie', count: 4 + wave - 10 },
        { type: 'troll', count: Math.floor((wave - 10) / 2) },
        { type: 'wraith', count: Math.floor((wave - 10) / 3) }
      ];
    } else if (wave <= 20) {
      enemiesToSpawn = [
        { type: 'troll', count: 6 },
        { type: 'wraith', count: 5 },
        { type: 'demon', count: 3 + Math.floor((wave - 15) / 2) },
        { type: 'banshee', count: Math.floor((wave - 15) / 2) }
      ];
    } else {
      enemiesToSpawn = [
        { type: 'demon', count: 8 },
        { type: 'banshee', count: 6 },
        { type: 'vampire', count: 4 + Math.floor((wave - 20) / 2) },
        { type: 'dragon', count: Math.floor((wave - 20) / 3) + 1 }
      ];
    }

    // Spawn enemies with delay and individual paths
    let spawnDelay = 0;
    enemiesToSpawn.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const enemyType = ENEMY_TYPES[type];
          const customPath = generateEnemyPath(i * 0.5 + Math.random() * 2);
          const startPoint = customPath[0];
          
          setEnemies(prev => [...prev, {
            id: `enemy-${Date.now()}-${Math.random()}`,
            type,
            x: startPoint.x,
            y: startPoint.y,
            health: enemyType.health + (wave - 1) * 25,
            maxHealth: enemyType.health + (wave - 1) * 25,
            pathIndex: 0,
            direction: { x: 0, y: 1 },
            customPath
          }]);
        }, spawnDelay);
        spawnDelay += 600; // 0.6 seconds between spawns
      }
    });

    AnalyticsService.trackWaveStarted(wave);
  }, [gameState.wave, generateEnemyPath]);

  const placeTower = useCallback((x: number, y: number) => {
    if (!gameState.selectedTower) return;
    
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return;
    if (grid[gridY][gridX] !== null) return;
    
    const towerType = TOWER_TYPES[gameState.selectedTower];
    if (gameState.gold < towerType.cost) return;

    // Check if placement doesn't completely block the path
    // For now, just prevent placing on the main path
    if (gridX === Math.floor(GRID_WIDTH / 2)) return;

    const newTower: Tower = {
      id: `tower-${Date.now()}-${Math.random()}`,
      type: gameState.selectedTower,
      x: gridX * GRID_SIZE + GRID_SIZE / 2,
      y: gridY * GRID_SIZE + GRID_SIZE / 2,
      level: 0,
      lastFire: 0,
      target: null
    };

    setTowers(prev => [...prev, newTower]);
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[gridY][gridX] = newTower;
      return newGrid;
    });
    
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - towerType.cost
    }));

    AnalyticsService.trackTowerPlaced({
      type: gameState.selectedTower,
      characterBased: false,
      cost: towerType.cost
    });
  }, [gameState.selectedTower, gameState.gold, grid]);

  const upgradeTower = useCallback((tower: Tower) => {
    const towerType = TOWER_TYPES[tower.type];
    if (tower.level >= towerType.upgrades.cost.length) return;
    
    const upgradeCost = towerType.upgrades.cost[tower.level];
    if (gameState.gold < upgradeCost) return;

    setTowers(prev => prev.map(t => 
      t.id === tower.id ? { ...t, level: t.level + 1 } : t
    ));
    
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - upgradeCost
    }));
  }, [gameState.gold]);

  const startWave = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    if (enemies.length === 0) {
      spawnWave();
    }
  }, [enemies.length, spawnWave]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      wave: 1,
      lives: 20,
      gold: 100,
      score: 0,
      isPlaying: false,
      isPaused: false,
      gameSpeed: 1,
      selectedTower: null
    });
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, GRID_HEIGHT * GRID_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(GRID_WIDTH * GRID_SIZE, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw path with improved visualization
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    enemyPath.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw towers with upgrade effects
    towers.forEach(tower => {
      const towerType = TOWER_TYPES[tower.type];
      const upgradeLevel = Math.min(tower.level + 1, 5);
      const effects = TOWER_UPGRADE_EFFECTS[`level${upgradeLevel}` as keyof typeof TOWER_UPGRADE_EFFECTS];
      
      // Draw glow effect for upgraded towers
      if (effects.glow > 0) {
        const glowIntensity = 0.3 + Math.sin(animationTime * 2) * 0.2;
        ctx.shadowColor = towerType.color;
        ctx.shadowBlur = effects.glow * glowIntensity;
        ctx.globalAlpha = 0.5;
        
        ctx.fillStyle = towerType.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, effects.size + effects.glow, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }
      
      // Draw main tower with size scaling
      const animationOffset = Math.sin(animationTime * 3 + tower.x * 0.01) * effects.animation;
      const currentSize = effects.size + animationOffset;
      
      ctx.fillStyle = towerType.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw tower border
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, currentSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw range if selected
      if (selectedTowerInstance?.id === tower.id) {
        const towerStats = {
          range: towerType.range + (tower.level > 0 ? towerType.upgrades.range[tower.level - 1] : 0)
        };
        ctx.strokeStyle = `${towerType.color}40`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, towerStats.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw level indicator with better styling
      if (tower.level > 0) {
        // Background circle
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y - currentSize - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Level number
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${tower.level + 1}`, tower.x, tower.y - currentSize - 10);
      }
    });

    // Draw enemies with real images
    enemies.forEach(enemy => {
      const enemyType = ENEMY_TYPES[enemy.type];
      const enemyImage = loadedImages[enemy.type];
      
      if (enemyImage) {
        // Draw enemy image with slight animation - center portion only
        const bobOffset = Math.sin(animationTime * 4 + enemy.x * 0.1) * 2;
        const size = 32;
        ctx.save();
        
        // Add hurt effect if damaged
        const damageRatio = 1 - (enemy.health / enemy.maxHealth);
        if (damageRatio > 0.5) {
          ctx.filter = `hue-rotate(${damageRatio * 180}deg) contrast(1.2)`;
        }
        
        // Calculate center crop of the sprite with intelligent frame detection
        const spriteWidth = enemyImage.naturalWidth;
        const spriteHeight = enemyImage.naturalHeight;
        
        // Detect if this is likely a sprite sheet (wider than tall) or single frame
        let frameWidth, centerFrameX;
        if (spriteWidth > spriteHeight * 2) {
          // Likely a sprite sheet - assume 3 frames (left, center, right)
          frameWidth = spriteWidth / 3;
          centerFrameX = frameWidth; // Second frame (center)
        } else {
          // Single frame or square - use the whole image
          frameWidth = spriteWidth;
          centerFrameX = 0;
        }
        
        ctx.drawImage(
          enemyImage,
          centerFrameX, 0, frameWidth, spriteHeight, // Source: center frame
          enemy.x - size/2, enemy.y - size/2 + bobOffset, size, size // Destination
        );
        ctx.restore();
      } else {
        // Fallback to colored circle if image not loaded
        ctx.fillStyle = enemyType.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Enhanced health bar with background
      const healthPercentage = enemy.health / enemy.maxHealth;
      const barWidth = 30;
      const barHeight = 6;
      const barY = enemy.y - 25;
      
      // Health bar background
      ctx.fillStyle = '#000000';
      ctx.fillRect(enemy.x - barWidth/2 - 1, barY - 1, barWidth + 2, barHeight + 2);
      
      // Health bar background (red)
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(enemy.x - barWidth/2, barY, barWidth, barHeight);
      
      // Health bar foreground (green)
      const healthColor = healthPercentage > 0.6 ? '#00FF00' : 
                         healthPercentage > 0.3 ? '#FFFF00' : '#FF4500';
      ctx.fillStyle = healthColor;
      ctx.fillRect(enemy.x - barWidth/2, barY, barWidth * healthPercentage, barHeight);
    });

    // Draw projectiles with real images and trails
    projectiles.forEach(projectile => {
      const projectileImage = loadedImages[projectile.type];
      
      if (projectileImage) {
        // Draw projectile trail
        ctx.save();
        ctx.globalAlpha = 0.3;
        const trailLength = 8;
        const dx = projectile.targetX - projectile.x;
        const dy = projectile.targetY - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const trailX = projectile.x - (dx / distance) * trailLength;
          const trailY = projectile.y - (dy / distance) * trailLength;
          
          // Use center portion of projectile sprite for trail with intelligent detection
          const projSpriteWidth = projectileImage.naturalWidth;
          const projSpriteHeight = projectileImage.naturalHeight;
          
          let projFrameWidth, projCenterFrameX;
          if (projSpriteWidth > projSpriteHeight * 2) {
            projFrameWidth = projSpriteWidth / 3;
            projCenterFrameX = projFrameWidth;
          } else {
            projFrameWidth = projSpriteWidth;
            projCenterFrameX = 0;
          }
          
          ctx.drawImage(
            projectileImage,
            projCenterFrameX, 0, projFrameWidth, projSpriteHeight,
            trailX - 6, trailY - 6, 12, 12
          );
        }
        ctx.restore();
        
        // Draw main projectile
        ctx.save();
        
        // Add rotation based on direction and use center portion with intelligent detection
        const projSpriteWidth = projectileImage.naturalWidth;
        const projSpriteHeight = projectileImage.naturalHeight;
        
        let projFrameWidth, projCenterFrameX;
        if (projSpriteWidth > projSpriteHeight * 2) {
          projFrameWidth = projSpriteWidth / 3;
          projCenterFrameX = projFrameWidth;
        } else {
          projFrameWidth = projSpriteWidth;
          projCenterFrameX = 0;
        }
        
        if (distance > 0) {
          const angle = Math.atan2(dy, dx);
          ctx.translate(projectile.x, projectile.y);
          ctx.rotate(angle);
          ctx.drawImage(
            projectileImage,
            projCenterFrameX, 0, projFrameWidth, projSpriteHeight,
            -8, -8, 16, 16
          );
        } else {
          ctx.drawImage(
            projectileImage,
            projCenterFrameX, 0, projFrameWidth, projSpriteHeight,
            projectile.x - 8, projectile.y - 8, 16, 16
          );
        }
        
        ctx.restore();
      } else {
        // Fallback to colored circle if image not loaded
        const colors = {
          arrow: '#8B4513',
          fire: '#FF4500',
          ice: '#00BFFF',
          lightning: '#9370DB',
          poison: '#32CD32'
        };
        ctx.fillStyle = colors[projectile.type as keyof typeof colors] || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [towers, enemies, projectiles, selectedTowerInstance]);

  // Handle canvas clicks
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on a tower
    const clickedTower = towers.find(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 20;
    });

    if (clickedTower) {
      setSelectedTowerInstance(clickedTower);
      return;
    }

    // Try to place tower
    placeTower(x, y);
  }, [towers, placeTower]);

  // Game over condition
  useEffect(() => {
    if (gameState.lives <= 0) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
      AnalyticsService.trackGameCompleted('defeat', gameState.score);
    }
  }, [gameState.lives, gameState.score]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-yellow-400">🏰 Tower Defense</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold">{gameState.lives}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{gameState.gold}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{gameState.score}</span>
            </div>
            
            <div className="text-sm">
              Wave: <span className="font-bold text-purple-400">{gameState.wave}</span>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={startWave}
            disabled={gameState.isPlaying}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-semibold transition-colors flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{gameState.isPlaying ? 'Playing' : 'Start Wave'}</span>
          </button>
          
          <button
            onClick={pauseGame}
            disabled={!gameState.isPlaying}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded font-semibold transition-colors"
          >
            {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tower Shop */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">🏗️ Towers</h3>
          <div className="space-y-2">
            {Object.values(TOWER_TYPES).map(tower => {
              const Icon = tower.icon;
              const canAfford = gameState.gold >= tower.cost;
              const isSelected = gameState.selectedTower === tower.id;
              
              return (
                <button
                  key={tower.id}
                  onClick={() => setGameState(prev => ({ 
                    ...prev, 
                    selectedTower: isSelected ? null : tower.id 
                  }))}
                  className={`w-full p-3 rounded flex items-center space-x-3 transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 shadow-lg' 
                      : canAfford 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canAfford}
                >
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ backgroundColor: tower.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{tower.name}</div>
                    <div className="text-sm text-gray-400">
                      💰{tower.cost} • ⚔️{tower.damage} • 📏{tower.range}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Battlefield</h3>
              <div className="text-sm text-gray-400">
                Enemies: {enemies.length} | Active Projectiles: {projectiles.length}
              </div>
            </div>
            
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * GRID_SIZE}
              height={GRID_HEIGHT * GRID_SIZE}
              onClick={handleCanvasClick}
              className="border border-gray-600 rounded bg-gray-900 cursor-crosshair"
            />
          </div>
        </div>

        {/* Tower Info & Game Stats */}
        <div className="space-y-4">
          {/* Selected Tower Info */}
          {selectedTowerInstance && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Tower Info</h3>
              <div className="space-y-2">
                <div className="font-medium">
                  {TOWER_TYPES[selectedTowerInstance.type].name}
                </div>
                <div className="text-sm text-gray-400">
                  Level {selectedTowerInstance.level + 1}
                </div>
                
                {selectedTowerInstance.level < TOWER_TYPES[selectedTowerInstance.type].upgrades.cost.length && (
                  <button
                    onClick={() => upgradeTower(selectedTowerInstance)}
                    disabled={gameState.gold < TOWER_TYPES[selectedTowerInstance.type].upgrades.cost[selectedTowerInstance.level]}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition-colors"
                  >
                    Upgrade (💰{TOWER_TYPES[selectedTowerInstance.type].upgrades.cost[selectedTowerInstance.level]})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Game Instructions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-green-400">📖 How to Play</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div>• Select a tower from the shop</div>
              <div>• Click on empty grid spaces to place towers</div>
              <div>• Don't block the enemy path completely</div>
              <div>• Upgrade towers by clicking on them</div>
              <div>• Survive all waves to win!</div>
            </div>
          </div>

          {/* Current Wave Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-purple-400">📊 Wave Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Wave:</span>
                <span className="font-semibold">{gameState.wave}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Enemies Left:</span>
                <span className="font-semibold">{enemies.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Towers Built:</span>
                <span className="font-semibold">{towers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}