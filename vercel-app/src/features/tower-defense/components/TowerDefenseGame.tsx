'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Zap, 
  Heart,
  Coins,
  Star,
  Target
} from 'lucide-react';

import { Character4D } from '@/types/Character';
import { 
  GameState, 
  GameMap as GameMapType, 
  Tower, 
  EnemyType
} from '@/types/TowerDefense';
import { TowerDefenseEngine } from '@/features/tower-defense/services/TowerDefenseEngine';
import { TowerConversionService } from '@/features/tower-defense/services/TowerConversionService';
import { AudioService } from '@/shared/services/AudioService';
import SpriteTowerGrid from './SpriteTowerGrid';

interface TowerDefenseGameProps {
  playerTowers?: Tower[];
  onTowerCreate?: (tower: Tower) => void;
  className?: string;
}

// Sample game map
const createDefaultMap = (): GameMapType => ({
  id: 'fortress_defense',
  name: 'Fortress Defense',
  description: 'Defend your fortress from waves of dimensional enemies',
  size: { width: 800, height: 600 },
  tileSize: 40,
  
  path: [
    { x: 0, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: 400, y: 400 },
    { x: 600, y: 400 },
    { x: 600, y: 300 },
    { x: 800, y: 300 }
  ],
  
  buildableAreas: [
    { x: 50, y: 50, width: 100, height: 100 },
    { x: 250, y: 50, width: 100, height: 100 },
    { x: 450, y: 50, width: 100, height: 100 },
    { x: 650, y: 50, width: 100, height: 100 },
    { x: 50, y: 450, width: 100, height: 100 },
    { x: 250, y: 450, width: 100, height: 100 },
    { x: 450, y: 450, width: 100, height: 100 },
    { x: 650, y: 450, width: 100, height: 100 }
  ],
  
  background: '#2d3748',
  obstacles: [],
  
  waves: [
    {
      id: 1,
      enemies: [
        { type: EnemyType.BASIC, count: 10, spawnDelay: 1, startTime: 0 },
        { type: EnemyType.FAST, count: 5, spawnDelay: 0.8, startTime: 5 }
      ],
      reward: { gold: 100, experience: 50 }
    },
    {
      id: 2,
      enemies: [
        { type: EnemyType.BASIC, count: 15, spawnDelay: 0.8, startTime: 0 },
        { type: EnemyType.HEAVY, count: 3, spawnDelay: 2, startTime: 8 },
        { type: EnemyType.FLYING, count: 5, spawnDelay: 1.5, startTime: 12 }
      ],
      reward: { gold: 150, experience: 80 }
    },
    {
      id: 3,
      enemies: [
        { type: EnemyType.FAST, count: 20, spawnDelay: 0.5, startTime: 0 },
        { type: EnemyType.MAGICAL, count: 8, spawnDelay: 1.2, startTime: 5 },
        { type: EnemyType.BOSS, count: 1, spawnDelay: 0, startTime: 15 }
      ],
      reward: { gold: 250, experience: 150 }
    }
  ]
});

export default function TowerDefenseGame({ 
  playerTowers = [], 
  onTowerCreate,
  className = '' 
}: TowerDefenseGameProps) {
  const [gameEngine, setGameEngine] = useState<TowerDefenseEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTowerForPlacement, setSelectedTowerForPlacement] = useState<Tower | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{x: number, y: number} | null>(null);
  const [showTowerSelection, setShowTowerSelection] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game engine
  useEffect(() => {
    const map = createDefaultMap();
    const engine = new TowerDefenseEngine(map, (state) => {
      setGameState(state);
    });
    
    setGameEngine(engine);
    setGameState(engine.getGameState());

    return () => {
      engine.destroy();
    };
  }, []);

  // Game control handlers
  const handleStartGame = useCallback(() => {
    if (gameEngine) {
      if (!gameStarted) {
        gameEngine.startNextWave();
        setGameStarted(true);
        // Play wave start sound
        const audioService = AudioService.getInstance();
        audioService.playWaveStart();
      }
      gameEngine.startGame();
    }
  }, [gameEngine, gameStarted]);

  const handlePauseGame = useCallback(() => {
    gameEngine?.pauseGame();
  }, [gameEngine]);

  const handleStopGame = useCallback(() => {
    gameEngine?.stopGame();
    setGameStarted(false);
  }, [gameEngine]);

  const handleNextWave = useCallback(() => {
    gameEngine?.startNextWave();
  }, [gameEngine]);

  const handleSpeedChange = useCallback((speed: number) => {
    gameEngine?.setGameSpeed(speed);
  }, [gameEngine]);

  // Tower placement handlers
  const handleMapClick = useCallback((x: number, y: number) => {
    if (selectedTowerForPlacement && gameEngine) {
      const success = gameEngine.placeTower(selectedTowerForPlacement, x, y);
      if (success) {
        // Play tower placed sound
        const audioService = AudioService.getInstance();
        audioService.playTowerPlaced(selectedTowerForPlacement.type);
        
        setSelectedTowerForPlacement(null);
        // Create NFT-mintable version if this was a player-created tower
        if (selectedTowerForPlacement.characterId && onTowerCreate) {
          onTowerCreate(selectedTowerForPlacement);
        }
      }
    }
  }, [selectedTowerForPlacement, gameEngine, onTowerCreate]);

  const handleTowerSelection = useCallback((tower: Tower) => {
    setSelectedTowerForPlacement(tower);
    setShowTowerSelection(false);
  }, []);

  const handleTowerClick = useCallback((towerId: string) => {
    gameEngine?.selectTower(towerId);
  }, [gameEngine]);

  const handleSellTower = useCallback(() => {
    if (gameState?.selectedTower && gameEngine) {
      // Play tower sold sound
      const audioService = AudioService.getInstance();
      audioService.playTowerSold();
      
      gameEngine.sellTower(gameState.selectedTower.id);
    }
  }, [gameState?.selectedTower, gameEngine]);

  // Create sample towers for testing (these would come from characters)
  const sampleTowers = useMemo(() => {
    const sampleCharacters = [
      {
        id: 'sample_archer',
        name: 'Flame Archer',
        attributes: { strength: 25, defense: 15, speed: 20, intelligence: 10, temporal: 15, spatial: 20, consciousness: 10, harmony: 15 },
        appearance: { bodyType: 'athletic', primaryColor: '#ff6b35', secondaryColor: '#f7931e', accentColor: '#ffcc02', dimensionalAura: 'stable', temporalTrail: false, spatialDistortion: 15, consciousnessGlow: true }
      },
      {
        id: 'sample_mage',
        name: 'Void Mage',
        attributes: { strength: 10, defense: 15, speed: 12, intelligence: 30, temporal: 25, spatial: 15, consciousness: 20, harmony: 18 },
        appearance: { bodyType: 'ethereal', primaryColor: '#6a0dad', secondaryColor: '#9932cc', accentColor: '#ba55d3', dimensionalAura: 'unstable', temporalTrail: true, spatialDistortion: 30, consciousnessGlow: true }
      },
      {
        id: 'sample_support',
        name: 'Harmony Guardian',
        attributes: { strength: 15, defense: 25, speed: 10, intelligence: 20, temporal: 10, spatial: 12, consciousness: 25, harmony: 30 },
        appearance: { bodyType: 'stocky', primaryColor: '#32cd32', secondaryColor: '#228b22', accentColor: '#adff2f', dimensionalAura: 'stable', temporalTrail: false, spatialDistortion: 8, consciousnessGlow: true }
      }
    ] as Character4D[];

    return sampleCharacters.map(char => TowerConversionService.convertCharacterToTower(char));
  }, []);

  const allAvailableTowers = [...sampleTowers, ...playerTowers];

  if (!gameState || !gameEngine) {
    return <div className="flex items-center justify-center h-64">Loading game...</div>;
  }

  return (
    <div className={`tower-defense-game bg-gray-900 text-white min-h-screen ${className}`}>
      {/* Game Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-bold text-blue-400">Tower Defense</h2>
            
            {/* Game Stats */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{gameState.health}/{gameState.maxHealth}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>{gameState.gold}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span>{gameState.score}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Wave {gameState.currentWave}</span>
              </div>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartGame}
              disabled={gameState.isPlaying && !gameState.isPaused}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center space-x-1 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Start</span>
            </button>
            
            <button
              onClick={handlePauseGame}
              disabled={!gameState.isPlaying}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center space-x-1 disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            
            <button
              onClick={handleStopGame}
              disabled={!gameState.isPlaying}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center space-x-1 disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
            
            <button
              onClick={handleNextWave}
              disabled={gameState.isPlaying || gameState.currentWave >= gameState.currentMap.waves.length}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-1 disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              <span>Next Wave</span>
            </button>
          </div>
        </div>
        
        {/* Wave Progress */}
        {gameState.isPlaying && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Wave Progress</span>
              <span>{gameState.enemiesRemaining} enemies remaining</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${gameState.waveProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {/* Game Map */}
        <div className="flex-1 relative">
          <GameMap
            gameState={gameState}
            selectedTowerForPlacement={selectedTowerForPlacement}
            hoveredPosition={hoveredPosition}
            onMapClick={handleMapClick}
            onTowerClick={handleTowerClick}
            onMouseMove={setHoveredPosition}
          />
        </div>
        
        {/* Side Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <div className="space-y-4">
            {/* Tower Selection */}
            <div>
              <button
                onClick={() => setShowTowerSelection(!showTowerSelection)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Place Tower</span>
              </button>
              
              {showTowerSelection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 border border-gray-600 rounded p-3 max-h-96 overflow-y-auto"
                >
                  <SpriteTowerGrid
                    towers={allAvailableTowers}
                    onTowerSelect={handleTowerSelection}
                    selectedTower={selectedTowerForPlacement}
                  />
                </motion.div>
              )}
            </div>
            
            {/* Selected Tower Info */}
            {gameState.selectedTower && (
              <div className="border border-gray-600 rounded p-3">
                <h3 className="font-bold mb-2">Tower Info</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {gameState.selectedTower.name}</div>
                  <div><strong>Type:</strong> {gameState.selectedTower.type}</div>
                  <div><strong>Level:</strong> {gameState.selectedTower.level}</div>
                  <div><strong>Damage:</strong> {Math.floor(gameState.selectedTower.stats.damage)}</div>
                  <div><strong>Range:</strong> {Math.floor(gameState.selectedTower.stats.range)}</div>
                  <div><strong>Fire Rate:</strong> {gameState.selectedTower.stats.fireRate.toFixed(1)}/s</div>
                  
                  {gameState.selectedTower.abilities.length > 0 && (
                    <div>
                      <strong>Abilities:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {gameState.selectedTower.abilities.map(ability => (
                          <li key={ability.id} className="text-xs">
                            {ability.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-600">
                    <button
                      onClick={handleSellTower}
                      className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Sell Tower (${Math.floor(gameState.selectedTower.cost * 0.7)})
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game Speed Controls */}
            <div className="border border-gray-600 rounded p-3">
              <h3 className="font-bold mb-2">Game Speed</h3>
              <div className="flex space-x-1">
                {[0.5, 1, 1.5, 2, 3].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded text-xs ${
                      gameState.gameSpeed === speed
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Game Map Component
interface GameMapProps {
  gameState: GameState;
  selectedTowerForPlacement: Tower | null;
  hoveredPosition: {x: number, y: number} | null;
  onMapClick: (x: number, y: number) => void;
  onTowerClick: (towerId: string) => void;
  onMouseMove: (pos: {x: number, y: number} | null) => void;
}

function GameMap({
  gameState,
  selectedTowerForPlacement,
  hoveredPosition,
  onMapClick,
  onTowerClick,
  onMouseMove
}: GameMapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Render game state to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = gameState.currentMap.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw path
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 20;
    ctx.beginPath();
    gameState.currentMap.path.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw buildable areas
    ctx.fillStyle = 'rgba(72, 187, 120, 0.2)';
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = 2;
    gameState.currentMap.buildableAreas.forEach(area => {
      ctx.fillRect(area.x, area.y, area.width, area.height);
      ctx.strokeRect(area.x, area.y, area.width, area.height);
    });

    // Draw towers (simplified circles for canvas)
    gameState.towers.forEach(tower => {
      // Tower base
      ctx.fillStyle = tower.visualData.baseColor;
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Tower selection indicator
      if (gameState.selectedTower?.id === tower.id) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Range indicator
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.stats.range, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tower name
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tower.name, tower.position.x, tower.position.y - 25);
    });

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(enemy.position.x, enemy.position.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Health bar
      const healthPercent = enemy.stats.currentHealth / enemy.stats.maxHealth;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(enemy.position.x - 10, enemy.position.y - 15, 20, 3);
      ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(enemy.position.x - 10, enemy.position.y - 15, 20 * healthPercent, 3);
    });

    // Draw projectiles
    gameState.projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.visualData.color;
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, projectile.visualData.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw placement preview
    if (selectedTowerForPlacement && hoveredPosition) {
      ctx.fillStyle = 'rgba(72, 187, 120, 0.5)';
      ctx.beginPath();
      ctx.arc(hoveredPosition.x, hoveredPosition.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Range preview
      ctx.strokeStyle = 'rgba(72, 187, 120, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hoveredPosition.x, hoveredPosition.y, selectedTowerForPlacement.stats.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [gameState, selectedTowerForPlacement, hoveredPosition]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a tower
    const clickedTower = gameState.towers.find(tower => {
      const distance = Math.sqrt(
        Math.pow(tower.position.x - x, 2) + Math.pow(tower.position.y - y, 2)
      );
      return distance <= 20;
    });

    if (clickedTower) {
      onTowerClick(clickedTower.id);
    } else {
      onMapClick(x, y);
    }
  }, [gameState.towers, onMapClick, onTowerClick]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTowerForPlacement) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onMouseMove({ x, y });
  }, [selectedTowerForPlacement, onMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      width={gameState.currentMap.size.width}
      height={gameState.currentMap.size.height}
      className="border border-gray-600 cursor-pointer"
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={() => onMouseMove(null)}
    />
  );
}