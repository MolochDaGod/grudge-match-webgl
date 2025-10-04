'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import { 
  Play, 
  Pause, 
  Settings, 
  Users, 
  Trophy, 
  Coins,
  Zap,
  Shield,
  Target,
  Wind,
  Send,
  Timer,
  Crown
} from "lucide-react";
import io, { Socket } from 'socket.io-client';
import { AnalyticsService } from '@/shared/utils/analytics';
import { useAutoAuth, PermissionGate } from '@/hooks/useAutoAuth';

const TOWER_TYPES = {
  BASIC: { name: "Basic", cost: 10, damage: 15, icon: Target, color: "bg-gray-500", range: 2 },
  SPLASH: { name: "Splash", cost: 25, damage: 20, icon: Zap, color: "bg-red-500", range: 2 },
  SLOW: { name: "Slow", cost: 20, damage: 10, icon: Wind, color: "bg-blue-500", range: 3 },
  AIR: { name: "Air", cost: 30, damage: 25, icon: Shield, color: "bg-green-500", range: 3 },
  MAGIC: { name: "Magic", cost: 40, damage: 35, icon: Zap, color: "bg-purple-500", range: 4 }
};

const UNIT_TYPES = {
  BASIC: { name: "Scout", cost: 5, hp: 50, speed: 1.0, reward: 2 },
  HEAVY: { name: "Warrior", cost: 15, hp: 150, speed: 0.7, reward: 8 },
  FAST: { name: "Runner", cost: 12, hp: 80, speed: 1.5, reward: 6 },
  FLYING: { name: "Flyer", cost: 20, hp: 120, speed: 1.2, reward: 10 },
  BOSS: { name: "Champion", cost: 50, hp: 500, speed: 0.5, reward: 25 }
};

interface GameState {
  gameId: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  players: Player[];
  maxPlayers: number;
  currentWave: number;
  timeRemaining: number;
  winner?: string;
}

interface Player {
  id: string;
  wallet: string;
  name: string;
  lives: number;
  gold: number;
  income: number;
  score: number;
  isAlive: boolean;
  isAI: boolean;
  difficulty?: 'easy' | 'hard';
  towers: TowerInstance[];
}

interface TowerInstance {
  id: string;
  type: keyof typeof TOWER_TYPES;
  x: number;
  y: number;
  level: number;
  kills: number;
  characterId?: string;
}

export default function TowerWarsGame() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { user, isAuthenticated, permissions } = useAutoAuth();
  
  const [gameState, setGameState] = useState<GameState>({
    gameId: '',
    status: 'waiting',
    players: [],
    maxPlayers: 4,
    currentWave: 0,
    timeRemaining: 0
  });
  
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [gameGrid, setGameGrid] = useState(() => {
    // Initialize 25x15 grid for more strategic space
    return Array(15).fill(null).map(() => Array(25).fill(null));
  });
  
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<keyof typeof UNIT_TYPES | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('easy');
  const [gameProgram, setGameProgram] = useState<Program | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [spectatorMode, setSpectatorMode] = useState(false);
  
  // Initialize game and connections
  useEffect(() => {
    // Initialize Solana program
    if (connection && publicKey) {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {});
      // Would initialize with actual IDL
      // setGameProgram(new Program(IDL, PROGRAM_ID, provider));
    }

    // Initialize Socket.IO connection
    const socketConnection = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001');
    setSocket(socketConnection);

    socketConnection.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    socketConnection.on('playerUpdate', (player: Player) => {
      const currentPlayerId = publicKey?.toString() || user?.id;
      if (player.wallet === currentPlayerId) {
        setLocalPlayer(player);
      }
    });

    return () => {
      socketConnection.disconnect();
    };
  }, [connection, publicKey, signTransaction]);

  // AI Implementation
  const aiTurn = useCallback((player: Player) => {
    if (!player.isAI) return;
    
    const difficulty = player.difficulty === 'easy' ? easyAI() : hardAI();
    
    setTimeout(() => {
      difficulty.makeMove(gameState, player, gameGrid);
    }, difficulty.reactionTime);
  }, [gameState, gameGrid]);

  const easyAI = () => ({
    reactionTime: Math.random() * 2000 + 2000, // 2-4 seconds
    economyFocus: 0.3,
    makeMove: (state: GameState, player: Player, grid: any) => {
      // Simple AI: build income towers 30% of the time
      if (Math.random() < 0.3 && player.gold >= 15) {
        buildIncomeTower(player);
      }
      
      // Place defensive towers randomly
      if (player.gold >= TOWER_TYPES.BASIC.cost) {
        const availableSpots = getAvailableSpots(grid, player.id);
        if (availableSpots.length > 0) {
          const randomSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
          const towerType = Math.random() > 0.7 ? 'SPLASH' : 'BASIC';
          placeTower(randomSpot.x, randomSpot.y, towerType, player.id);
        }
      }
      
      // Send basic units occasionally
      if (Math.random() < 0.4 && player.gold >= UNIT_TYPES.BASIC.cost) {
        sendUnits('BASIC', 3, getRandomOpponent());
      }
    }
  });

  const hardAI = () => ({
    reactionTime: Math.random() * 600 + 200, // 200-800ms
    economyFocus: 0.85,
    makeMove: (state: GameState, player: Player, grid: any) => {
      // Advanced economy management
      const incomeRatio = player.income / player.gold;
      if (incomeRatio < 0.2 && player.gold >= 20) {
        buildIncomeTower(player);
      }
      
      // Strategic tower placement
      const strategicSpots = calculateStrategicPositions(grid, state);
      if (strategicSpots.length > 0 && player.gold >= TOWER_TYPES.MAGIC.cost) {
        const bestSpot = strategicSpots[0];
        const optimalTower = determineOptimalTower(player, bestSpot);
        placeTower(bestSpot.x, bestSpot.y, optimalTower, player.id);
      }
      
      // Coordinated unit attacks
      const weakestOpponent = findWeakestOpponent(state.players);
      if (weakestOpponent && player.gold >= 50) {
        // Send mixed unit composition
        sendUnits('HEAVY', 2, weakestOpponent.id);
        sendUnits('FAST', 4, weakestOpponent.id);
      }
    }
  });

  // Game Actions
  const joinGame = async (gameId?: string) => {
    if (!isAuthenticated || !socket) return;

    try {
      AnalyticsService.trackFeatureUsed('tower_wars_join');
      
      // Use wallet address if connected, otherwise use guest user ID
      const playerId = publicKey?.toString() || user.id;
      const playerName = publicKey 
        ? `Player ${publicKey.toString().slice(0, 6)}` 
        : `Guest ${user.id.slice(0, 6)}`;
      
      socket.emit('joinGame', {
        wallet: playerId,
        gameId: gameId || 'default',
        playerName,
        isGuest: !publicKey
      });
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const createGame = async (maxPlayers: number, entryFee: number) => {
    if (!isAuthenticated || !socket) return;

    try {
      // Only create on-chain game instance if wallet is connected and has blockchain permissions
      let gameAccount = null;
      if (permissions.canUseBlockchain && gameProgram && publicKey) {
        gameAccount = web3.Keypair.generate();
        
        await gameProgram.methods
          .initializeGame(maxPlayers, new BN(entryFee), new BN(1800)) // 30 minute game
          .accounts({
            game: gameAccount.publicKey,
            authority: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .signers([gameAccount])
          .rpc();
      }

      // Notify server of new game (works for both guest and wallet users)
      const playerId = publicKey?.toString() || user.id;
      socket.emit('createGame', {
        gameAccount: gameAccount?.publicKey.toString() || `guest-${Date.now()}`,
        maxPlayers,
        entryFee: permissions.canUseBlockchain ? entryFee : 0, // No entry fee for guests
        creator: playerId,
        isGuestGame: !publicKey
      });

      AnalyticsService.trackFeatureUsed('tower_wars_create');
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const placeTower = async (x: number, y: number, towerType: keyof typeof TOWER_TYPES, playerId?: string) => {
    const tower = TOWER_TYPES[towerType];
    const currentPlayer = playerId ? gameState.players.find(p => p.id === playerId) : localPlayer;
    
    if (!currentPlayer || currentPlayer.gold < tower.cost || gameGrid[y][x]) return;

    try {
      // Update local state immediately
      const newTower: TowerInstance = {
        id: `${playerId || localPlayer?.id}-${Date.now()}`,
        type: towerType,
        x,
        y,
        level: 1,
        kills: 0
      };

      setGameGrid(prev => {
        const newGrid = [...prev];
        newGrid[y][x] = newTower;
        return newGrid;
      });

      // Emit to server for multiplayer sync
      socket?.emit('placeTower', {
        gameId: gameState.gameId,
        playerId: playerId || localPlayer?.id,
        tower: newTower
      });

      // On-chain transaction if it's the local player and has blockchain permissions
      if (!playerId && permissions.canUseBlockchain && gameProgram && publicKey) {
        await gameProgram.methods
          .placeTower(x, y, { [towerType.toLowerCase()]: {} })
          .accounts({
            game: gameState.gameId,
            player: publicKey,
          })
          .rpc();
      }

      AnalyticsService.trackTowerPlaced({
        type: towerType,
        characterBased: false,
        cost: tower.cost
      });

    } catch (error) {
      console.error('Failed to place tower:', error);
      // Revert local state on error
      setGameGrid(prev => {
        const newGrid = [...prev];
        newGrid[y][x] = null;
        return newGrid;
      });
    }
  };

  const sendUnits = async (unitType: keyof typeof UNIT_TYPES, count: number, targetPlayerId: string) => {
    const unit = UNIT_TYPES[unitType];
    const totalCost = unit.cost * count;
    
    if (!localPlayer || localPlayer.gold < totalCost) return;

    try {
      socket?.emit('sendUnits', {
        gameId: gameState.gameId,
        fromPlayer: localPlayer.id,
        toPlayer: targetPlayerId,
        unitType,
        count,
        totalCost
      });

      AnalyticsService.trackFeatureUsed('send_units', {
        unit_type: unitType,
        count,
        target_player: targetPlayerId
      });

    } catch (error) {
      console.error('Failed to send units:', error);
    }
  };

  const startWave = () => {
    if (gameState.status !== 'playing') return;
    
    socket?.emit('startWave', {
      gameId: gameState.gameId,
      wave: gameState.currentWave + 1
    });

    AnalyticsService.trackWaveStarted(gameState.currentWave + 1);
  };

  // Helper Functions
  const getAvailableSpots = (grid: any, playerId: string) => {
    const spots = [];
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 25; x++) {
        if (!grid[y][x]) {
          spots.push({ x, y });
        }
      }
    }
    return spots;
  };

  const calculateStrategicPositions = (grid: any, state: GameState) => {
    // Complex strategic calculation for hard AI
    const positions = [];
    
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 25; x++) {
        if (!grid[y][x]) {
          let score = 0;
          
          // Prefer chokepoints (middle of map)
          const centerDistance = Math.abs(x - 12.5) + Math.abs(y - 7.5);
          score += Math.max(0, 20 - centerDistance);
          
          // Synergy with existing towers
          const nearbyTowers = getNearbyTowers(x, y, grid, 3);
          score += nearbyTowers.length * 8;
          
          // Coverage area value
          score += calculateCoverageValue(x, y);
          
          positions.push({ x, y, score });
        }
      }
    }
    
    return positions.sort((a, b) => b.score - a.score);
  };

  const determineOptimalTower = (player: Player, position: any) => {
    const { gold, income } = player;
    
    if (gold >= TOWER_TYPES.MAGIC.cost && income > 20) return 'MAGIC';
    if (gold >= TOWER_TYPES.AIR.cost && position.score > 15) return 'AIR';
    if (gold >= TOWER_TYPES.SPLASH.cost) return 'SPLASH';
    if (gold >= TOWER_TYPES.SLOW.cost) return 'SLOW';
    return 'BASIC';
  };

  const buildIncomeTower = (player: Player) => {
    // Simulate income tower building
    socket?.emit('buildIncome', {
      gameId: gameState.gameId,
      playerId: player.id
    });
  };

  const getRandomOpponent = () => {
    const opponents = gameState.players.filter(p => p.isAlive && p.id !== localPlayer?.id);
    return opponents[Math.floor(Math.random() * opponents.length)]?.id;
  };

  const findWeakestOpponent = (players: Player[]) => {
    return players
      .filter(p => p.isAlive && !p.isAI)
      .sort((a, b) => a.lives - b.lives)[0];
  };

  const getNearbyTowers = (x: number, y: number, grid: any, radius: number) => {
    const towers = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < 25 && newY >= 0 && newY < 15 && grid[newY][newX]) {
          towers.push(grid[newY][newX]);
        }
      }
    }
    return towers;
  };

  const calculateCoverageValue = (x: number, y: number) => {
    // Calculate how much area this position can cover
    return Math.min(x, 25 - x) + Math.min(y, 15 - y);
  };

  // Run AI for AI players
  useEffect(() => {
    gameState.players.forEach(player => {
      if (player.isAI && gameState.status === 'playing') {
        aiTurn(player);
      }
    });
  }, [gameState.players, gameState.status, aiTurn]);

  // Handle cell clicks
  const handleCellClick = (x: number, y: number) => {
    if (selectedTower && localPlayer?.gold && localPlayer.gold >= TOWER_TYPES[selectedTower].cost) {
      placeTower(x, y, selectedTower);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-yellow-400">⚔️ Tower Wars Arena</h1>
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-5 h-5" />
            <span>{gameState.players.length}/{gameState.maxPlayers}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${{
            'waiting': 'bg-yellow-500/20 text-yellow-400',
            'starting': 'bg-blue-500/20 text-blue-400',
            'playing': 'bg-green-500/20 text-green-400',
            'finished': 'bg-red-500/20 text-red-400'
          }[gameState.status]}`}>
            {gameState.status.toUpperCase()}
          </div>
          
          {/* User Status Display */}
          <div className="flex items-center space-x-2 text-sm">
            {publicKey ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Wallet Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Guest Mode</span>
              </div>
            )}
          </div>
        </div>
        
        {localPlayer && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{localPlayer.gold}</span>
              <span className="text-sm text-gray-400">(+{localPlayer.income}/wave)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{localPlayer.score}</span>
            </div>
            <div className="text-red-400 font-semibold">
              ❤️ {localPlayer.lives}
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      {gameState.status === 'waiting' && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Waiting for Players...</h3>
              <p className="text-gray-400">Game will start when {gameState.maxPlayers} players join</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => joinGame()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? 'Join Game' : 'Loading...'}
              </button>
              <select 
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'hard')}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="easy">Add Easy AI</option>
                <option value="hard">Add Hard AI</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tower Shop */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">🏗️ Towers</h3>
          <div className="space-y-2">
            {Object.entries(TOWER_TYPES).map(([key, tower]) => {
              const Icon = tower.icon;
              const canAfford = localPlayer?.gold && localPlayer.gold >= tower.cost;
              const isSelected = selectedTower === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTower(isSelected ? null : key as keyof typeof TOWER_TYPES)}
                  className={`w-full p-3 rounded flex items-center space-x-3 transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 shadow-lg' 
                      : canAfford 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canAfford}
                >
                  <div className={`w-10 h-10 rounded ${tower.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
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

          <h3 className="text-lg font-semibold mt-6 mb-4 text-red-400">⚔️ Units</h3>
          <div className="space-y-2">
            {Object.entries(UNIT_TYPES).map(([key, unit]) => {
              const canAfford = localPlayer?.gold && localPlayer.gold >= unit.cost;
              const isSelected = selectedUnit === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedUnit(isSelected ? null : key as keyof typeof UNIT_TYPES)}
                  className={`w-full p-2 rounded flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-red-600' 
                      : canAfford 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canAfford}
                >
                  <div>
                    <div className="font-medium text-sm">{unit.name}</div>
                    <div className="text-xs text-gray-400">
                      💰{unit.cost} • ❤️{unit.hp} • 🏃{unit.speed}x
                    </div>
                  </div>
                  <Send className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Battlefield</h3>
              <div className="flex space-x-2">
                {gameState.status === 'playing' && (
                  <>
                    <button
                      onClick={startWave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Wave {gameState.currentWave + 1}</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Timer className="w-4 h-4" />
                      <span>{Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-25 gap-px bg-gray-600 p-2 rounded" style={{ fontSize: '8px' }}>
              {gameGrid.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`aspect-square border border-gray-700 rounded-sm cursor-pointer transition-all text-center ${
                      cell 
                        ? `${TOWER_TYPES[cell.type]?.color || 'bg-gray-500'}` 
                        : 'bg-gray-800 hover:bg-gray-700'
                    } ${
                      y === 7 ? 'border-yellow-500' : '' // Main path
                    } ${
                      selectedTower ? 'hover:ring-2 hover:ring-blue-400' : ''
                    }`}
                    title={cell ? `${TOWER_TYPES[cell.type]?.name} L${cell.level}` : undefined}
                  >
                    {cell && (
                      <div className="w-full h-full flex items-center justify-center">
                        {React.createElement(TOWER_TYPES[cell.type]?.icon || Target, {
                          className: "w-2 h-2 text-white"
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Players & Game Info */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>Players</span>
            </h3>
            <div className="space-y-2">
              {gameState.players.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`p-2 rounded border transition-colors ${
                    !player.isAlive 
                      ? 'bg-red-900/20 border-red-500/30 opacity-60'
                      : player.id === localPlayer?.id
                        ? 'bg-blue-900/20 border-blue-500/50'
                        : 'bg-gray-700/50 border-gray-600/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">
                        {player.name}
                        {player.isAI && <span className="text-xs text-gray-400 ml-1">(AI-{player.difficulty})</span>}
                        {player.id === localPlayer?.id && <span className="text-xs text-blue-400 ml-1">(You)</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        ❤️{player.lives} • 💰{player.gold} • 🏆{player.score}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${player.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                        {player.isAlive ? 'ALIVE' : 'DEAD'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">📊 Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Wave:</span>
                <span>{gameState.currentWave}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Towers:</span>
                <span>{localPlayer?.towers.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Income/Wave:</span>
                <span className="text-yellow-400">+{localPlayer?.income || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">🎮 Controls</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div>• Select tower/unit from shop</div>
              <div>• Click grid to place towers</div>
              <div>• Target opponents with units</div>
              <div>• Build economy for late game</div>
              <div>• Last player standing wins!</div>
            </div>
          </div>

          {/* Blockchain Features */}
          <PermissionGate requiredPermission="canUseBlockchain">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-purple-400">⛓️ Blockchain Features</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <div>• Tournament entry fees</div>
                <div>• On-chain game verification</div>
                <div>• Prize pool distribution</div>
                <div>• Leaderboard rewards</div>
              </div>
            </div>
          </PermissionGate>

          {/* Guest Mode Info */}
          {!publicKey && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">👤 Guest Mode</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>You're playing as a guest! You can:</p>
                <div className="space-y-1 text-sm text-gray-400 ml-2">
                  <div>• Join and create games</div>
                  <div>• Play full tower defense matches</div>
                  <div>• Compete against other players</div>
                </div>
                <p className="text-blue-400 font-medium mt-2">
                  Connect a wallet for blockchain features and prizes!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}