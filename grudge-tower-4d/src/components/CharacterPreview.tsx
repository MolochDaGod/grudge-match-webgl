'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Shield, Gauge, Brain, Clock, Maximize, Eye, Music } from 'lucide-react';
import { CharacterAttributes, CharacterAppearance, CharacterRarity } from '@/types/Character';

interface CharacterPreviewProps {
  attributes: CharacterAttributes;
  appearance: CharacterAppearance;
  name: string;
  rarity: CharacterRarity;
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
}: CharacterPreviewProps) {
  const totalPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const maxAttribute = Math.max(...Object.values(attributes));

  // Calculate visual effects based on attributes
  const getEffectIntensity = (attr: number) => Math.min(100, (attr / 20) * 100);
  const temporalIntensity = getEffectIntensity(attributes.temporal);
  const spatialIntensity = getEffectIntensity(attributes.spatial);
  const consciousnessIntensity = getEffectIntensity(attributes.consciousness);

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
    <div className=\"relative\">
      {/* Character Visual */}
      <div className=\"relative h-64 bg-gradient-to-b from-black/40 to-black/60 rounded-lg border border-gray-600/30 overflow-hidden mb-4\">
        {/* Background Effects */}
        {appearance.consciousnessGlow && (
          <motion.div
            className=\"absolute inset-0\"
            animate={{
              background: [
                `radial-gradient(circle at 50% 50%, ${appearance.accentColor}20 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${appearance.accentColor}30 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${appearance.accentColor}20 0%, transparent 70%)`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: \"easeInOut\",
            }}
          />
        )}

        {/* Spatial Distortion Effect */}
        {appearance.spatialDistortion > 20 && (
          <div
            className=\"absolute inset-0 opacity-30\"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, ${appearance.primaryColor}40, ${appearance.secondaryColor}40, ${appearance.primaryColor}40)`,
              filter: `blur(${appearance.spatialDistortion / 10}px)`,
            }}
          />
        )}

        {/* Character Silhouette */}
        <div className=\"absolute inset-0 flex items-center justify-center\">
          <motion.div
            className={`w-24 h-32 rounded-full relative ${getBodyTypeSize()}`}
            style={{
              background: `linear-gradient(180deg, ${appearance.primaryColor}80, ${appearance.secondaryColor}80)`,
              boxShadow: appearance.consciousnessGlow 
                ? `0 0 20px ${appearance.accentColor}60` 
                : 'none',
            }}
            animate={
              appearance.dimensionalAura === 'pulsing'
                ? {
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }
                : appearance.dimensionalAura === 'shifting'
                ? {
                    background: [
                      `linear-gradient(180deg, ${appearance.primaryColor}80, ${appearance.secondaryColor}80)`,
                      `linear-gradient(180deg, ${appearance.secondaryColor}80, ${appearance.accentColor}80)`,
                      `linear-gradient(180deg, ${appearance.accentColor}80, ${appearance.primaryColor}80)`,
                      `linear-gradient(180deg, ${appearance.primaryColor}80, ${appearance.secondaryColor}80)`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: \"easeInOut\",
            }}
          >
            {/* Aura Effect */}
            {appearance.dimensionalAura === 'fractal' && (
              <motion.div
                className=\"absolute -inset-2 rounded-full border-2 opacity-50\"
                style={{ borderColor: appearance.accentColor }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: \"linear\" }}
              />
            )}

            {/* Temporal Trail */}
            {appearance.temporalTrail && (
              <motion.div
                className=\"absolute -inset-1 rounded-full\"
                style={{
                  background: `linear-gradient(90deg, transparent, ${appearance.primaryColor}40, transparent)`,
                }}
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity, ease: \"easeInOut\" }}
              />
            )}

            {/* Core */}
            <div
              className=\"absolute inset-2 rounded-full\"
              style={{
                background: `radial-gradient(circle, ${appearance.accentColor}60, transparent)`,
              }}
            />
          </motion.div>
        </div>

        {/* Rarity Indicator */}
        <div className=\"absolute top-2 right-2\">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-black/60 ${rarityColors[rarity]}`}>
            <Star className=\"w-3 h-3 fill-current\" />
            <span className=\"text-xs font-semibold capitalize\">{rarity}</span>
          </div>
        </div>

        {/* Total Points */}
        <div className=\"absolute top-2 left-2\">
          <div className=\"px-2 py-1 rounded-full bg-black/60 text-xs font-semibold\">
            {totalPoints} pts
          </div>
        </div>
      </div>

      {/* Character Name */}
      <div className=\"text-center mb-4\">
        <h3 className=\"text-lg font-bold\">{name}</h3>
        <div className=\"text-sm text-gray-400\">
          {appearance.bodyType} • {rarity}
        </div>
      </div>

      {/* Quick Stats */}
      <div className=\"grid grid-cols-4 gap-2 mb-4\">
        {Object.entries(attributes).map(([key, value]) => {
          const Icon = attributeIcons[key as keyof CharacterAttributes];
          const isHighest = value === maxAttribute;

          return (
            <div
              key={key}
              className={`flex flex-col items-center p-2 rounded-lg bg-black/20 border ${\n                isHighest ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-600/30'\n              }`}
            >
              <Icon className=\"w-4 h-4 mb-1 text-gray-400\" />
              <span className=\"text-xs font-mono font-semibold\">{value}</span>
              <span className=\"text-xs text-gray-500 capitalize\">{key}</span>
            </div>
          );
        })}
      </div>

      {/* Attribute Radar Preview */}
      <div className=\"bg-black/20 rounded-lg p-3\">
        <h4 className=\"text-sm font-medium mb-2\">Power Distribution</h4>
        <div className=\"space-y-1\">
          {Object.entries(attributes).map(([key, value]) => {
            const percentage = (value / 20) * 100;
            const Icon = attributeIcons[key as keyof CharacterAttributes];

            return (
              <div key={key} className=\"flex items-center space-x-2\">
                <Icon className=\"w-3 h-3 text-gray-500\" />
                <span className=\"text-xs w-16 text-gray-400 capitalize\">{key}</span>
                <div className=\"flex-1 bg-gray-700 rounded-full h-1.5\">
                  <motion.div
                    className=\"h-full rounded-full\"
                    style={{
                      background: `linear-gradient(90deg, ${appearance.primaryColor}, ${appearance.secondaryColor})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
                <span className=\"text-xs font-mono w-6 text-right\">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}