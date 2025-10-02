'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Gauge, Brain, Clock, Maximize, Eye, Music } from 'lucide-react';
import { 
  CharacterAttributes, 
  CHARACTER_CONSTRAINTS 
} from '@/types/Character';
import { CharacterService } from '@/services/CharacterService';

interface AttributeControlsProps {
  attributes: CharacterAttributes;
  onChange: (attr: keyof CharacterAttributes, value: number) => void;
  totalPoints: number;
  onLoadPreset: (preset: any) => void;
}

const attributeConfig = [
  {
    key: 'strength' as keyof CharacterAttributes,
    name: 'Strength',
    description: 'Physical power and damage output',
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    key: 'defense' as keyof CharacterAttributes,
    name: 'Defense',
    description: 'Health and damage resistance',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    key: 'speed' as keyof CharacterAttributes,
    name: 'Speed',
    description: 'Movement and attack speed',
    icon: Gauge,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    key: 'intelligence' as keyof CharacterAttributes,
    name: 'Intelligence',
    description: 'Special abilities and resource generation',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    key: 'temporal' as keyof CharacterAttributes,
    name: 'Temporal',
    description: 'Time-based abilities and prediction',
    icon: Clock,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    key: 'spatial' as keyof CharacterAttributes,
    name: 'Spatial',
    description: 'Dimensional movement and distortion',
    icon: Maximize,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    key: 'consciousness' as keyof CharacterAttributes,
    name: 'Consciousness',
    description: 'Awareness and predictive analysis',
    icon: Eye,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    key: 'harmony' as keyof CharacterAttributes,
    name: 'Harmony',
    description: 'Balance and synchronization',
    icon: Music,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
];

export default function AttributeControls({ 
  attributes, 
  onChange, 
  totalPoints,
  onLoadPreset 
}: AttributeControlsProps) {
  const presets = CharacterService.getPresets();

  const handleSliderChange = (attr: keyof CharacterAttributes, value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue >= CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN && 
        numValue <= CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX) {
      onChange(attr, numValue);
    }
  };

  const incrementAttribute = (attr: keyof CharacterAttributes) => {
    const current = attributes[attr];
    if (current < CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX) {
      onChange(attr, current + 1);
    }
  };

  const decrementAttribute = (attr: keyof CharacterAttributes) => {
    const current = attributes[attr];
    if (current > CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN) {
      onChange(attr, current - 1);
    }
  };

  const resetToDefault = () => {
    attributeConfig.forEach(({ key }) => {
      onChange(key, 10); // Reset to 10 (80 total points)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=\"bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6\"
    >
      <div className=\"flex items-center justify-between mb-6\">
        <h2 className=\"text-xl font-semibold flex items-center space-x-2\">
          <Zap className=\"w-5 h-5\" />
          <span>4D Attributes</span>
        </h2>
        
        <div className=\"flex items-center space-x-4 text-sm\">
          <span className={`font-semibold ${\n            totalPoints > 160 ? 'text-red-400' : \n            totalPoints > 140 ? 'text-yellow-400' : \n            'text-green-400'\n          }`}>
            {totalPoints} / 160 pts\n          </span>\n          \n          <button\n            onClick={resetToDefault}\n            className=\"text-gray-400 hover:text-white transition-colors\"\n          >\n            Reset\n          </button>\n        </div>\n      </div>\n\n      {/* Attribute Grid */}\n      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6\">\n        {attributeConfig.map(({ key, name, description, icon: Icon, color, bgColor }) => {\n          const value = attributes[key];\n          const percentage = ((value - CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN) / \n            (CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX - CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN)) * 100;\n\n          return (\n            <div\n              key={key}\n              className={`p-4 rounded-lg border border-gray-600/30 ${bgColor} backdrop-blur-sm`}\n            >\n              <div className=\"flex items-center justify-between mb-2\">\n                <div className=\"flex items-center space-x-2\">\n                  <Icon className={`w-4 h-4 ${color}`} />\n                  <span className=\"font-medium\">{name}</span>\n                </div>\n                <div className=\"flex items-center space-x-2\">\n                  <button\n                    onClick={() => decrementAttribute(key)}\n                    disabled={value <= CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN}\n                    className=\"w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-xs hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"\n                  >\n                    -\n                  </button>\n                  <span className=\"w-8 text-center font-mono font-semibold\">{value}</span>\n                  <button\n                    onClick={() => incrementAttribute(key)}\n                    disabled={value >= CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX}\n                    className=\"w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-xs hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"\n                  >\n                    +\n                  </button>\n                </div>\n              </div>\n              \n              <div className=\"mb-2\">\n                <div className=\"w-full bg-gray-700 rounded-full h-2\">\n                  <div\n                    className={`h-2 rounded-full transition-all duration-300 ${color.replace('text-', 'bg-')}`}\n                    style={{ width: `${percentage}%` }}\n                  />\n                </div>\n              </div>\n\n              <input\n                type=\"range\"\n                min={CHARACTER_CONSTRAINTS.ATTRIBUTE_MIN}\n                max={CHARACTER_CONSTRAINTS.ATTRIBUTE_MAX}\n                value={value}\n                onChange={(e) => handleSliderChange(key, e.target.value)}\n                className=\"w-full slider\"\n              />\n\n              <p className=\"text-xs text-gray-400 mt-1\">{description}</p>\n            </div>\n          );\n        })}\n      </div>\n\n      {/* Character Presets */}\n      <div>\n        <h3 className=\"text-lg font-medium mb-3\">Quick Presets</h3>\n        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-3\">\n          {presets.map((preset, index) => {\n            const presetTotal = Object.values(preset.attributes).reduce((sum, val) => sum + (val || 0), 0);\n            \n            return (\n              <button\n                key={index}\n                onClick={() => onLoadPreset(preset)}\n                className=\"text-left p-3 bg-black/30 rounded-lg border border-gray-600/30 hover:border-purple-500/50 transition-all group\"\n              >\n                <h4 className=\"font-semibold text-sm mb-1 group-hover:text-purple-300\">\n                  {preset.name}\n                </h4>\n                <p className=\"text-xs text-gray-400 mb-2\">{preset.description}</p>\n                <div className=\"text-xs\">\n                  <span className=\"text-green-400\">{presetTotal} points</span>\n                  <span className=\"text-gray-500 ml-2\">\n                    {CharacterService.calculateRarity(preset.attributes as CharacterAttributes)}\n                  </span>\n                </div>\n              </button>\n            );\n          })}\n        </div>\n      </div>\n\n      {/* Attribute Breakdown */}\n      <div className=\"mt-6 p-4 bg-black/30 rounded-lg\">\n        <h4 className=\"font-medium mb-3 text-sm\">Attribute Categories</h4>\n        <div className=\"grid grid-cols-2 gap-4 text-xs\">\n          <div>\n            <span className=\"text-gray-400\">Physical:</span>\n            <span className=\"ml-2 font-semibold\">\n              {attributes.strength + attributes.defense + attributes.speed} pts\n            </span>\n          </div>\n          <div>\n            <span className=\"text-gray-400\">Mental:</span>\n            <span className=\"ml-2 font-semibold\">\n              {attributes.intelligence + attributes.consciousness} pts\n            </span>\n          </div>\n          <div>\n            <span className=\"text-gray-400\">4D Powers:</span>\n            <span className=\"ml-2 font-semibold\">\n              {attributes.temporal + attributes.spatial} pts\n            </span>\n          </div>\n          <div>\n            <span className=\"text-gray-400\">Balance:</span>\n            <span className=\"ml-2 font-semibold\">\n              {attributes.harmony} pts\n            </span>\n          </div>\n        </div>\n      </div>\n    </motion.div>\n  );\n}