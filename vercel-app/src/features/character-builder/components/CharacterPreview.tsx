'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Shield, Gauge, Brain, Clock, Maximize, Eye, Music } from 'lucide-react';
import { Character4D, CharacterAttributes, CharacterAppearance, CharacterRarity } from '@/types/Character';
import { SPRITE_CATALOG, getSpritesByCategory, getSpriteById } from '@/lib/sprite-renderer';
import SpriteRenderer from './SpriteRenderer';
import SpritePreview from './SpritePreview';

interface CharacterPreviewProps {
  attributes: CharacterAttributes;
  appearance: CharacterAppearance;
  name: string;
  rarity: CharacterRarity;
  character?: Character4D;
}

const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
  mythic: 'text-pink-400',
};

const attributeIcons = {
  strength: Zap,
  defense: Shield,
  speed: Gauge,
  intelligence: Brain,
  temporal: Clock,
  spatial: Maximize,
  consciousness: Eye,
  harmony: Music,
};

export default function CharacterPreview({
  attributes,
  appearance,
  name,
  rarity,
  character,
}: CharacterPreviewProps) {
  const totalPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const maxAttribute = Math.max(...Object.values(attributes));

  // Character silhouette based on body type
  const getBodyTypeSize = () => {
    switch (appearance.bodyType) {
      case 'slim': return 'scale-90';
      case 'athletic': return 'scale-100';
      case 'bulky': return 'scale-110';
      case 'ethereal': return 'scale-95 opacity-90';
      default: return 'scale-100';
    }
  };

  return (
    <div className="relative">
      {/* Character Visual */}
      <div className="relative mb-4">
        {character ? (
          <div className="flex justify-center">
            <SpriteRenderer 
              character={character} 
              width={250} 
              height={300} 
              animated={true} 
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <SpritePreview 
              attributes={attributes}
              appearance={appearance}
              width={200}
              height={200}
            />
          </div>
        )}
        
        {/* Rarity Indicator */}
        <div className="absolute top-2 right-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-black/60 ${rarityColors[rarity]}`}>
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-semibold capitalize">{rarity}</span>
          </div>
        </div>

        {/* Total Points */}
        <div className="absolute top-2 left-2">
          <div className="px-2 py-1 rounded-full bg-black/60 text-xs font-semibold">
            {totalPoints} pts
          </div>
        </div>
      </div>

      {/* Character Name */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">{name}</h3>
        <div className="text-sm text-gray-400">
          {appearance.bodyType} • {rarity}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(attributes).map(([key, value]) => {
          const Icon = attributeIcons[key as keyof CharacterAttributes];
          const isHighest = value === maxAttribute;

          return (
            <div
              key={key}
              className={`flex flex-col items-center p-2 rounded-lg bg-black/20 border ${
                isHighest ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-600/30'
              }`}
            >
              <Icon className="w-4 h-4 mb-1 text-gray-400" />
              <span className="text-xs font-mono font-semibold">{value}</span>
              <span className="text-xs text-gray-500 capitalize">{key}</span>
            </div>
          );
        })}
      </div>

      {/* Attribute Radar Preview */}
      <div className="bg-black/20 rounded-lg p-3">
        <h4 className="text-sm font-medium mb-2">Power Distribution</h4>
        <div className="space-y-1">
          {Object.entries(attributes).map(([key, value]) => {
            const percentage = (value / 20) * 100;
            const Icon = attributeIcons[key as keyof CharacterAttributes];

            return (
              <div key={key} className="flex items-center space-x-2">
                <Icon className="w-3 h-3 text-gray-500" />
                <span className="text-xs w-16 text-gray-400 capitalize">{key}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${appearance.primaryColor}, ${appearance.secondaryColor})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
                <span className="text-xs font-mono w-6 text-right">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}