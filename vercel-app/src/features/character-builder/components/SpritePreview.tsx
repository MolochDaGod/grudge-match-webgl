'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CharacterAttributes, CharacterAppearance } from '@/types/Character';
import { SPRITE_CATALOG, getSpriteById } from '@/lib/sprite-renderer';

interface SpritePreviewProps {
  attributes: CharacterAttributes;
  appearance: CharacterAppearance;
  width?: number;
  height?: number;
}

export default function SpritePreview({ 
  attributes, 
  appearance, 
  width = 200, 
  height = 200 
}: SpritePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sprites, setSprites] = useState<{
    character: HTMLImageElement | null;
    weapon: HTMLImageElement | null;
    armor: HTMLImageElement | null;
  }>({
    character: null,
    weapon: null,
    armor: null
  });

  // Determine which sprites to use based on attributes
  const getCharacterSprite = () => {
    // Use different character bases based on attributes
    if (attributes.strength > 15 && attributes.defense > 15) {
      return getSpriteById('char_orc1') || getSpriteById('char_human');
    } else if (attributes.intelligence > 15 || attributes.consciousness > 15) {
      return getSpriteById('char_demon1') || getSpriteById('char_human');
    } else if (attributes.speed > 15 || attributes.temporal > 15) {
      return getSpriteById('char_demon2') || getSpriteById('char_human');
    }
    return getSpriteById('char_human');
  };

  const getWeaponSprite = () => {
    if (attributes.strength > 15) {
      // Prefer melee weapons for high strength
      return getSpriteById('weapon_battle_bow') || getSpriteById('weapon_crossbow');
    } else if (attributes.intelligence > 15) {
      // Prefer magical weapons for high intelligence
      return getSpriteById('weapon_sniper_bow') || getSpriteById('weapon_battle_bow');
    } else if (attributes.speed > 15) {
      // Prefer ranged weapons for high speed
      return getSpriteById('weapon_hunter_bow') || getSpriteById('weapon_long_bow');
    }
    return getSpriteById('weapon_pistol') || getSpriteById('weapon_battle_bow');
  };

  const getArmorSprite = () => {
    switch (appearance.bodyType) {
      case 'bulky':
        return getSpriteById('armor_heavy_steel') || getSpriteById('armor_knight_armor') || getSpriteById('armor_chainmail');
      case 'athletic':
        return getSpriteById('armor_leather_tunic') || getSpriteById('armor_hunter_vest');
      case 'ethereal':
        return getSpriteById('armor_wizard_robe') || getSpriteById('armor_fire_wizard_robe');
      default:
        return getSpriteById('armor_iron_armor') || getSpriteById('armor_leather_tunic');
    }
  };

  // Load sprites
  useEffect(() => {
    const loadSprites = async () => {
      setIsLoading(true);
      
      try {
        const characterSprite = getCharacterSprite();
        const weaponSprite = getWeaponSprite();
        const armorSprite = getArmorSprite();

        const loadImage = (sprite: any): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            if (!sprite) {
              reject(new Error('No sprite data'));
              return;
            }
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => {
              console.warn(`Failed to load sprite: ${sprite.path}`);
              // Create a colored fallback
              const fallbackImg = createFallbackImage(sprite);
              resolve(fallbackImg);
            };
            
            img.src = sprite.path;
          });
        };

        const [characterImg, weaponImg, armorImg] = await Promise.allSettled([
          characterSprite ? loadImage(characterSprite) : Promise.resolve(null),
          weaponSprite ? loadImage(weaponSprite) : Promise.resolve(null),
          armorSprite ? loadImage(armorSprite) : Promise.resolve(null)
        ]);

        setSprites({
          character: characterImg.status === 'fulfilled' ? characterImg.value : null,
          weapon: weaponImg.status === 'fulfilled' ? weaponImg.value : null,
          armor: armorImg.status === 'fulfilled' ? armorImg.value : null
        });

      } catch (error) {
        console.error('Error loading sprites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSprites();
  }, [attributes, appearance]);

  const createFallbackImage = (sprite: any): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Color based on sprite category
    const colors = {
      character: '#4ade80',
      weapon: '#ef4444',
      armor: '#3b82f6',
      effect: '#f59e0b'
    };

    ctx.fillStyle = colors[sprite.category as keyof typeof colors] || '#9ca3af';
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(sprite.name.substring(0, 8), 32, 36);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  };

  // Render sprites to canvas
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, `${appearance.primaryColor}20`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw character base (layer 0)
    if (sprites.character) {
      ctx.drawImage(
        sprites.character, 
        centerX - 32, 
        centerY - 32, 
        64, 
        64
      );
    }

    // Draw armor (layer 2)
    if (sprites.armor) {
      ctx.drawImage(
        sprites.armor, 
        centerX - 32, 
        centerY - 32, 
        64, 
        64
      );
    }

    // Draw weapon (layer 1)
    if (sprites.weapon) {
      ctx.drawImage(
        sprites.weapon, 
        centerX + 20, 
        centerY - 40, 
        32, 
        32
      );
    }

    // Add visual effects based on appearance
    if (appearance.consciousnessGlow) {
      const glowGradient = ctx.createRadialGradient(centerX, centerY - 20, 0, centerX, centerY - 20, 40);
      glowGradient.addColorStop(0, `${appearance.accentColor}60`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (appearance.spatialDistortion > 20) {
      ctx.strokeStyle = `${appearance.secondaryColor}40`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.stroke();
    }

  }, [sprites, appearance, width, height, isLoading]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-purple-500/30 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-sm text-white">Loading sprites...</div>
        </div>
      )}
      
      {/* Debug info */}
      <div className="absolute bottom-1 left-1 right-1 bg-black/70 rounded px-2 py-1 text-xs text-white">
        <div className="text-center">
          {sprites.character ? '✓' : '✗'} Character 
          {sprites.armor ? ' | ✓' : ' | ✗'} Armor 
          {sprites.weapon ? ' | ✓' : ' | ✗'} Weapon
        </div>
      </div>
    </div>
  );
}