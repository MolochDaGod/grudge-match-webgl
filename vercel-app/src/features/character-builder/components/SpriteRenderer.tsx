'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Character4D, CharacterAppearance } from '@/types/Character';
import { SpriteRenderer as SpriteRenderingEngine, CharacterLayer, getSpriteById } from '@/lib/sprite-renderer';

interface SpriteRendererProps {
  character: Character4D;
  width?: number;
  height?: number;
  animated?: boolean;
}

export default function SpriteRenderer({ 
  character, 
  width = 200, 
  height = 300,
  animated = true 
}: SpriteRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteEngineRef = useRef<SpriteRenderingEngine | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Initialize sprite renderer
  useEffect(() => {
    if (canvasRef.current && !spriteEngineRef.current) {
      spriteEngineRef.current = new SpriteRenderingEngine(canvasRef.current);
      spriteEngineRef.current.resize(width, height);
    }
  }, [width, height]);

  // Render character using sprite system
  useEffect(() => {
    if (spriteEngineRef.current) {
      renderCharacterSprite();
    }
  }, [character, animationFrame]);

  // Animation loop
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4); // 4-frame animation
    }, 200); // 200ms per frame

    return () => clearInterval(interval);
  }, [animated]);

  const renderCharacterSprite = async () => {
    if (!spriteEngineRef.current) return;

    try {
      const layers: CharacterLayer[] = [];
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Determine character class sprite based on attributes
      let characterSpriteId = 'char_warrior'; // Default
      if (character.attributes.intelligence > character.attributes.strength && 
          character.attributes.intelligence > character.attributes.agility) {
        characterSpriteId = 'char_mage';
      } else if (character.attributes.agility > character.attributes.strength) {
        characterSpriteId = 'char_archer';
      }

      // Add character base layer
      const characterSprite = getSpriteById(characterSpriteId);
      if (characterSprite) {
        layers.push({
          id: 'character',
          name: 'Character Base',
          layer: 0,
          sprite: characterSprite,
          position: { x: centerX, y: centerY },
          scale: { x: 1, y: 1 },
          rotation: 0,
          visible: true
        });
      }

      // Add weapon based on highest combat attribute
      let weaponSpriteId: string | undefined;
      if (character.attributes.strength > 15) {
        weaponSpriteId = 'weapon_sword';
      } else if (character.attributes.intelligence > 15) {
        weaponSpriteId = 'weapon_staff';
      } else if (character.attributes.agility > 15) {
        weaponSpriteId = 'weapon_bow';
      }

      if (weaponSpriteId) {
        const weaponSprite = getSpriteById(weaponSpriteId);
        if (weaponSprite) {
          layers.push({
            id: 'weapon',
            name: 'Weapon',
            layer: 1,
            sprite: weaponSprite,
            position: { x: centerX + 20, y: centerY - 20 },
            scale: { x: 1, y: 1 },
            rotation: 0,
            visible: true
          });
        }
      }

      // Add armor based on defense/body type
      let armorSpriteId: string | undefined;
      switch (character.appearance.bodyType) {
        case 'bulky':
          armorSpriteId = 'armor_plate';
          break;
        case 'athletic':
          armorSpriteId = 'armor_leather';
          break;
        case 'ethereal':
          armorSpriteId = 'armor_robe';
          break;
        default:
          armorSpriteId = 'armor_leather';
      }

      const armorSprite = getSpriteById(armorSpriteId);
      if (armorSprite) {
        layers.push({
          id: 'armor',
          name: 'Armor',
          layer: 2,
          sprite: armorSprite,
          position: { x: centerX, y: centerY },
          scale: { x: 1, y: 1 },
          rotation: 0,
          visible: true
        });
      }

      // Render all layers
      await spriteEngineRef.current.renderCharacter(layers);
      
      // Add post-processing effects
      addPostProcessingEffects();
      
    } catch (error) {
      console.error('Failed to render character sprite:', error);
      // Fallback to original rendering
      renderFallbackCharacter();
    }
  };

  const addPostProcessingEffects = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Add dimensional effects on top of sprite
    if (character.appearance.consciousnessGlow) {
      drawConsciousnessGlow(ctx, character.attributes.consciousness, width, height);
    }
    
    if (character.appearance.temporalTrail) {
      drawTemporalTrail(ctx, width, height, animationFrame);
    }
    
    if (character.appearance.spatialDistortion > 0) {
      drawSpatialDistortion(ctx, character.appearance.spatialDistortion, width, height, animationFrame);
    }
  };

  const renderFallbackCharacter = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw fallback
    ctx.clearRect(0, 0, width, height);
    drawCharacterSprite(ctx, character, width, height, animationFrame);
  };

  const drawCharacterSprite = (
    ctx: CanvasRenderingContext2D,
    character: Character4D,
    w: number,
    h: number,
    frame: number
  ) => {
    const { appearance, attributes } = character;
    
    // Background aura based on dimensional energy
    drawDimensionalAura(ctx, appearance, w, h);
    
    // Base body
    drawBody(ctx, appearance, w, h, frame);
    
    // Equipment overlays
    drawEquipment(ctx, character, w, h, frame);
    
    // Temporal trail effect
    if (appearance.temporalTrail) {
      drawTemporalTrail(ctx, w, h, frame);
    }
    
    // Consciousness glow
    if (appearance.consciousnessGlow) {
      drawConsciousnessGlow(ctx, attributes.consciousness, w, h);
    }
    
    // Spatial distortion effect
    if (appearance.spatialDistortion > 0) {
      drawSpatialDistortion(ctx, appearance.spatialDistortion, w, h, frame);
    }
  };

  const drawDimensionalAura = (
    ctx: CanvasRenderingContext2D,
    appearance: CharacterAppearance,
    w: number,
    h: number
  ) => {
    const centerX = w / 2;
    const centerY = h / 2;
    
    // Create radial gradient for aura
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, w / 2);
    
    switch (appearance.dimensionalAura) {
      case 'stable':
        gradient.addColorStop(0, `${appearance.primaryColor}40`);
        gradient.addColorStop(1, 'transparent');
        break;
      case 'pulsing':
        const alpha = Math.sin(Date.now() * 0.005) * 0.3 + 0.4;
        gradient.addColorStop(0, `${appearance.primaryColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        break;
      case 'chaotic':
        gradient.addColorStop(0, `${appearance.accentColor}60`);
        gradient.addColorStop(0.5, `${appearance.secondaryColor}40`);
        gradient.addColorStop(1, 'transparent');
        break;
      case 'fractal':
        // Create a complex fractal-like pattern
        for (let i = 0; i < 5; i++) {
          gradient.addColorStop(i * 0.2, `${appearance.primaryColor}${Math.floor((0.8 - i * 0.1) * 255).toString(16).padStart(2, '0')}`);
        }
        break;
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const drawBody = (
    ctx: CanvasRenderingContext2D,
    appearance: CharacterAppearance,
    w: number,
    h: number,
    frame: number
  ) => {
    const centerX = w / 2;
    const baseY = h * 0.8;
    
    // Animation offset
    const bobOffset = Math.sin(frame * 0.5) * 2;
    
    // Draw body based on body type
    ctx.fillStyle = appearance.primaryColor;
    
    switch (appearance.bodyType) {
      case 'athletic':
        drawAthleticBody(ctx, centerX, baseY + bobOffset, w * 0.3, h * 0.6);
        break;
      case 'bulky':
        drawBulkyBody(ctx, centerX, baseY + bobOffset, w * 0.4, h * 0.65);
        break;
      case 'ethereal':
        drawEtherealBody(ctx, centerX, baseY + bobOffset, w * 0.25, h * 0.7, frame);
        break;
    }
    
    // Add secondary color details
    ctx.fillStyle = appearance.secondaryColor;
    drawBodyDetails(ctx, centerX, baseY + bobOffset, appearance.bodyType, w, h);
    
    // Accent color highlights
    ctx.fillStyle = appearance.accentColor;
    drawAccentDetails(ctx, centerX, baseY + bobOffset, w, h);
  };

  const drawAthleticBody = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Head
    ctx.beginPath();
    ctx.arc(x, y - h * 0.85, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Torso
    ctx.fillRect(x - w * 0.12, y - h * 0.65, w * 0.24, h * 0.4);
    
    // Arms
    ctx.fillRect(x - w * 0.35, y - h * 0.55, w * 0.1, h * 0.3);
    ctx.fillRect(x + w * 0.25, y - h * 0.55, w * 0.1, h * 0.3);
    
    // Legs
    ctx.fillRect(x - w * 0.15, y - h * 0.2, w * 0.1, h * 0.2);
    ctx.fillRect(x + w * 0.05, y - h * 0.2, w * 0.1, h * 0.2);
  };

  const drawBulkyBody = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Larger, more muscular proportions
    ctx.beginPath();
    ctx.arc(x, y - h * 0.85, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillRect(x - w * 0.18, y - h * 0.65, w * 0.36, h * 0.45);
    ctx.fillRect(x - w * 0.4, y - h * 0.55, w * 0.15, h * 0.35);
    ctx.fillRect(x + w * 0.25, y - h * 0.55, w * 0.15, h * 0.35);
    ctx.fillRect(x - w * 0.18, y - h * 0.15, w * 0.15, h * 0.15);
    ctx.fillRect(x + w * 0.03, y - h * 0.15, w * 0.15, h * 0.15);
  };

  const drawEtherealBody = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) => {
    // Semi-transparent, flowing form
    ctx.globalAlpha = 0.8;
    
    // Flowing, organic shapes
    const floatOffset = Math.sin(frame * 0.3) * 5;
    
    ctx.beginPath();
    ctx.arc(x, y - h * 0.85 + floatOffset, w * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Flowing torso
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.45 + floatOffset, w * 0.1, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wispy limbs
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = w * 0.05;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.2, y - h * 0.5 + floatOffset);
    ctx.quadraticCurveTo(x - w * 0.3, y - h * 0.3 + floatOffset, x - w * 0.25, y - h * 0.1 + floatOffset);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y - h * 0.5 + floatOffset);
    ctx.quadraticCurveTo(x + w * 0.3, y - h * 0.3 + floatOffset, x + w * 0.25, y - h * 0.1 + floatOffset);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  };

  const drawBodyDetails = (ctx: CanvasRenderingContext2D, x: number, y: number, bodyType: string, w: number, h: number) => {
    // Add clothing/armor details based on body type
    switch (bodyType) {
      case 'athletic':
        // Light armor details
        ctx.fillRect(x - w * 0.08, y - h * 0.6, w * 0.16, w * 0.05);
        break;
      case 'bulky':
        // Heavy armor plates
        ctx.fillRect(x - w * 0.15, y - h * 0.6, w * 0.3, w * 0.08);
        ctx.fillRect(x - w * 0.12, y - h * 0.45, w * 0.24, w * 0.06);
        break;
      case 'ethereal':
        // Magical runes or energy patterns
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x + (i - 1) * w * 0.1, y - h * 0.5, w * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  };

  const drawAccentDetails = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Accent color highlights and details
    ctx.beginPath();
    ctx.arc(x - w * 0.05, y - h * 0.87, w * 0.02, 0, Math.PI * 2); // Left eye
    ctx.arc(x + w * 0.05, y - h * 0.87, w * 0.02, 0, Math.PI * 2); // Right eye
    ctx.fill();
    
    // Decorative elements
    ctx.fillRect(x - w * 0.02, y - h * 0.55, w * 0.04, w * 0.02);
  };

  const drawEquipment = (ctx: CanvasRenderingContext2D, character: Character4D, w: number, h: number, frame: number) => {
    // Draw equipped items based on character's equipment
    // This would integrate with the equipment system
    const centerX = w / 2;
    const baseY = h * 0.8;
    
    // Example weapon
    if (character.attributes.strength > 15) {
      ctx.strokeStyle = character.appearance.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + w * 0.2, baseY - h * 0.4);
      ctx.lineTo(centerX + w * 0.35, baseY - h * 0.7);
      ctx.stroke();
    }
  };

  const drawTemporalTrail = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    // Create trailing effect for temporal characters
    ctx.globalAlpha = 0.3;
    const trailOffset = frame * 2;
    
    for (let i = 1; i <= 3; i++) {
      ctx.fillStyle = `hsl(${240 + trailOffset + i * 20}, 70%, 60%)`;
      ctx.fillRect(w * 0.1 - i * 5, h * 0.2, w * 0.8, h * 0.6);
    }
    
    ctx.globalAlpha = 1;
  };

  const drawConsciousnessGlow = (ctx: CanvasRenderingContext2D, consciousness: number, w: number, h: number) => {
    // Glow intensity based on consciousness level
    const intensity = consciousness / 20;
    const centerX = w / 2;
    const centerY = h * 0.15;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, w * 0.3);
    gradient.addColorStop(0, `rgba(255, 255, 0, ${intensity * 0.8})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const drawSpatialDistortion = (ctx: CanvasRenderingContext2D, distortion: number, w: number, h: number, frame: number) => {
    // Create visual distortion effects
    const intensity = distortion / 100;
    
    // Wavy distortion lines
    ctx.strokeStyle = `rgba(128, 0, 255, ${intensity})`;
    ctx.lineWidth = 2;
    
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      
      for (let x = 0; x < w; x += 10) {
        const waveY = y + Math.sin((x + frame * 10) * 0.1) * intensity * 10;
        ctx.lineTo(x, waveY);
      }
      
      ctx.stroke();
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-purple-500/30 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800"
      />
      
      {/* Character info overlay */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
        <div className="font-semibold">{character.name}</div>
        <div className="text-gray-300">{character.metadata.rarity}</div>
      </div>
    </div>
  );
}