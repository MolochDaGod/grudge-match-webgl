'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tower, TowerType } from '@/types/TowerDefense';
import { SpriteRenderer, getSpriteById } from '@/lib/sprite-renderer';

interface SpriteTowerGridProps {
  towers: Tower[];
  onTowerSelect?: (tower: Tower) => void;
  selectedTower?: Tower | null;
  className?: string;
}

interface SpriteTowerCardProps {
  tower: Tower;
  isSelected: boolean;
  onClick: () => void;
}

function SpriteTowerCard({ tower, isSelected, onClick }: SpriteTowerCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRendererRef = useRef<SpriteRenderer | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Initialize sprite renderer
  useEffect(() => {
    if (canvasRef.current && !spriteRendererRef.current) {
      spriteRendererRef.current = new SpriteRenderer(canvasRef.current);
      spriteRendererRef.current.resize(120, 120);
    }
  }, []);

  // Render tower sprite
  useEffect(() => {
    if (spriteRendererRef.current) {
      renderTowerSprite();
    }
  }, [tower]);

  const renderTowerSprite = async () => {
    if (!spriteRendererRef.current) return;

    try {
      // Determine sprite based on tower type
      let spriteId: string;
      switch (tower.type) {
        case TowerType.ARCHER:
        case TowerType.SNIPER:
          spriteId = 'tower_archer';
          break;
        case TowerType.CANNON:
        case TowerType.ARTILLERY:
          spriteId = 'tower_cannon';
          break;
        case TowerType.MAGIC:
        case TowerType.ELEMENTAL:
          spriteId = 'tower_magic';
          break;
        default:
          spriteId = 'tower_archer';
      }

      const sprite = getSpriteById(spriteId);
      if (sprite) {
        await spriteRendererRef.current.renderSprite(
          sprite,
          60, 60, // Center of 120x120 canvas
          {
            scale: { x: 1.5, y: 1.5 },
            alpha: 1
          }
        );
        setImageLoaded(true);
      }
    } catch (error) {
      console.error('Failed to render tower sprite:', error);
      drawFallbackTower();
    }
  };

  const drawFallbackTower = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 120, 120);
    
    // Draw simple tower representation
    const centerX = 60;
    const centerY = 60;
    
    // Base
    ctx.fillStyle = tower.visualData.baseColor || '#666666';
    ctx.fillRect(centerX - 20, centerY - 20, 40, 40);
    
    // Tower type indicator
    ctx.fillStyle = tower.visualData.accentColor || '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tower.type.charAt(0).toUpperCase(), centerX, centerY + 5);
    
    setImageLoaded(true);
  };

  const getTowerTypeColor = (type: TowerType): string => {
    switch (type) {
      case TowerType.ARCHER:
      case TowerType.SNIPER:
        return 'border-green-500';
      case TowerType.CANNON:
      case TowerType.ARTILLERY:
        return 'border-red-500';
      case TowerType.MAGIC:
      case TowerType.ELEMENTAL:
        return 'border-purple-500';
      case TowerType.SUPPORT:
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  const getTowerRarityGlow = (tower: Tower): string => {
    // Generate glow based on tower stats/cost
    const totalStats = tower.stats.damage + tower.stats.range + tower.stats.fireRate * 10;
    if (totalStats > 150) return 'shadow-lg shadow-yellow-500/50';
    if (totalStats > 100) return 'shadow-lg shadow-purple-500/50';
    if (totalStats > 75) return 'shadow-md shadow-blue-500/50';
    if (totalStats > 50) return 'shadow-md shadow-green-500/50';
    return '';
  };

  return (
    <motion.div
      className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 bg-gray-800 hover:bg-gray-700 ${
        isSelected 
          ? `${getTowerTypeColor(tower.type)} ring-2 ring-offset-2 ring-offset-gray-800 ${getTowerRarityGlow(tower)}` 
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Tower Sprite */}
      <div className="flex justify-center mb-2 relative">
        <canvas
          ref={canvasRef}
          className={`rounded border ${imageLoaded ? 'opacity-100' : 'opacity-50'}`}
          style={{ imageRendering: 'pixelated', backgroundColor: '#1a202c' }}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Tower Info */}
      <div className="text-center">
        <h3 className="font-semibold text-sm text-white mb-1 truncate">
          {tower.name}
        </h3>
        
        <div className="text-xs text-gray-300 mb-2 capitalize">
          {tower.type}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="text-red-400 font-mono">
              {Math.floor(tower.stats.damage)}
            </div>
            <div className="text-gray-500">DMG</div>
          </div>
          
          <div className="text-center">
            <div className="text-blue-400 font-mono">
              {Math.floor(tower.stats.range)}
            </div>
            <div className="text-gray-500">RNG</div>
          </div>
          
          <div className="text-center">
            <div className="text-green-400 font-mono">
              {tower.stats.fireRate.toFixed(1)}
            </div>
            <div className="text-gray-500">SPD</div>
          </div>
        </div>

        {/* Cost */}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-yellow-400 font-semibold text-sm">
            ${tower.cost}
          </div>
        </div>

        {/* Abilities Indicator */}
        {tower.abilities.length > 0 && (
          <div className="absolute top-1 right-1">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {tower.abilities.length}
            </div>
          </div>
        )}

        {/* Character-based tower indicator */}
        {tower.characterId && (
          <div className="absolute top-1 left-1">
            <div className="w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-xs">★</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection glow animation */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-400"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

export default function SpriteTowerGrid({ 
  towers, 
  onTowerSelect, 
  selectedTower,
  className = ''
}: SpriteTowerGridProps) {
  // Group towers by type for better organization
  const groupedTowers = towers.reduce((groups, tower) => {
    if (!groups[tower.type]) {
      groups[tower.type] = [];
    }
    groups[tower.type].push(tower);
    return groups;
  }, {} as Record<TowerType, Tower[]>);

  return (
    <div className={`sprite-tower-grid ${className}`}>
      {Object.keys(groupedTowers).length > 1 ? (
        // Show grouped towers with category headers
        <div className="space-y-4">
          {Object.entries(groupedTowers).map(([type, typeTowers]) => (
            <div key={type}>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 capitalize">
                {type} Towers ({typeTowers.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {typeTowers.map((tower) => (
                  <SpriteTowerCard
                    key={tower.id}
                    tower={tower}
                    isSelected={selectedTower?.id === tower.id}
                    onClick={() => onTowerSelect?.(tower)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Simple grid for single type or mixed towers
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {towers.map((tower) => (
            <SpriteTowerCard
              key={tower.id}
              tower={tower}
              isSelected={selectedTower?.id === tower.id}
              onClick={() => onTowerSelect?.(tower)}
            />
          ))}
        </div>
      )}

      {towers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No towers available</p>
          <p className="text-sm mt-1">Create characters to unlock towers</p>
        </div>
      )}
    </div>
  );
}