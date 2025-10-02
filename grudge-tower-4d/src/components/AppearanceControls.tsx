'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles } from 'lucide-react';
import { CharacterAppearance } from '@/types/Character';

interface AppearanceControlsProps {
  appearance: CharacterAppearance;
  onChange: (key: keyof CharacterAppearance, value: any) => void;
}

const bodyTypeOptions = [
  { value: 'slim', label: 'Slim', description: 'Agile and lightweight' },
  { value: 'athletic', label: 'Athletic', description: 'Balanced physique' },
  { value: 'bulky', label: 'Bulky', description: 'Strong and sturdy' },
  { value: 'ethereal', label: 'Ethereal', description: 'Otherworldly presence' },
] as const;

const auraOptions = [
  { value: 'stable', label: 'Stable', description: 'Consistent energy field' },
  { value: 'shifting', label: 'Shifting', description: 'Dynamic color changes' },
  { value: 'pulsing', label: 'Pulsing', description: 'Rhythmic energy waves' },
  { value: 'fractal', label: 'Fractal', description: 'Complex geometric patterns' },
] as const;

const colorPresets = [
  { name: 'Fire', primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' },
  { name: 'Ice', primary: '#4A90E2', secondary: '#7B68EE', accent: '#87CEEB' },
  { name: 'Nature', primary: '#228B22', secondary: '#32CD32', accent: '#9ACD32' },
  { name: 'Shadow', primary: '#4B0082', secondary: '#8B008B', accent: '#9370DB' },
  { name: 'Energy', primary: '#FFD700', secondary: '#FFA500', accent: '#FFFF00' },
  { name: 'Mystic', primary: '#FF1493', secondary: '#FF69B4', accent: '#DDA0DD' },
];

export default function AppearanceControls({ appearance, onChange }: AppearanceControlsProps) {
  const handleColorChange = (key: keyof CharacterAppearance, color: string) => {
    onChange(key, color);
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    onChange('primaryColor', preset.primary);
    onChange('secondaryColor', preset.secondary);
    onChange('accentColor', preset.accent);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className=\"bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6\"
    >
      <h2 className=\"text-xl font-semibold mb-6 flex items-center space-x-2\">
        <Palette className=\"w-5 h-5\" />
        <span>Appearance & Effects</span>
      </h2>

      <div className=\"space-y-6\">
        {/* Body Type */}
        <div>
          <label className=\"block text-sm font-medium mb-3\">Body Type</label>
          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-2\">
            {bodyTypeOptions.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => onChange('bodyType', value)}
                className={`p-3 rounded-lg border text-left transition-all ${\n                  appearance.bodyType === value\n                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'\n                    : 'border-gray-600/30 bg-black/20 hover:border-purple-500/50'\n                }`}
              >
                <div className=\"font-medium text-sm\">{label}</div>
                <div className=\"text-xs text-gray-400 mt-1\">{description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className=\"block text-sm font-medium mb-3\">Color Scheme</label>
          
          {/* Color Presets */}
          <div className=\"mb-4\">
            <div className=\"text-xs text-gray-400 mb-2\">Quick Presets</div>
            <div className=\"flex flex-wrap gap-2\">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className=\"flex items-center space-x-2 px-3 py-2 rounded-lg bg-black/30 border border-gray-600/30 hover:border-purple-500/50 transition-colors\"
                >
                  <div className=\"flex space-x-1\">
                    <div 
                      className=\"w-3 h-3 rounded-full\" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className=\"w-3 h-3 rounded-full\" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div 
                      className=\"w-3 h-3 rounded-full\" 
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <span className=\"text-xs\">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Color Controls */}
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div>
              <label className=\"block text-xs text-gray-400 mb-2\">Primary Color</label>
              <div className=\"flex items-center space-x-2\">
                <input
                  type=\"color\"
                  value={appearance.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className=\"w-12 h-12 rounded-lg border border-gray-600 cursor-pointer\"
                />
                <input
                  type=\"text\"
                  value={appearance.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className=\"flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-sm focus:border-purple-400 focus:outline-none\"
                  placeholder=\"#4A90E2\"
                />
              </div>
            </div>

            <div>
              <label className=\"block text-xs text-gray-400 mb-2\">Secondary Color</label>
              <div className=\"flex items-center space-x-2\">
                <input
                  type=\"color\"
                  value={appearance.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className=\"w-12 h-12 rounded-lg border border-gray-600 cursor-pointer\"
                />
                <input
                  type=\"text\"
                  value={appearance.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className=\"flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-sm focus:border-purple-400 focus:outline-none\"
                  placeholder=\"#7B68EE\"
                />
              </div>
            </div>

            <div>
              <label className=\"block text-xs text-gray-400 mb-2\">Accent Color</label>
              <div className=\"flex items-center space-x-2\">
                <input
                  type=\"color\"
                  value={appearance.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className=\"w-12 h-12 rounded-lg border border-gray-600 cursor-pointer\"
                />
                <input
                  type=\"text\"
                  value={appearance.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className=\"flex-1 px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-sm focus:border-purple-400 focus:outline-none\"
                  placeholder=\"#FFD700\"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4D Visual Effects */}
        <div className=\"border-t border-gray-600/30 pt-6\">
          <h3 className=\"text-lg font-medium mb-4 flex items-center space-x-2\">
            <Sparkles className=\"w-4 h-4\" />
            <span>4D Visual Effects</span>
          </h3>

          <div className=\"space-y-4\">
            {/* Dimensional Aura */}
            <div>
              <label className=\"block text-sm font-medium mb-2\">Dimensional Aura</label>
              <div className=\"grid grid-cols-2 md:grid-cols-4 gap-2\">
                {auraOptions.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => onChange('dimensionalAura', value)}
                    className={`p-3 rounded-lg border text-left transition-all ${\n                      appearance.dimensionalAura === value\n                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'\n                        : 'border-gray-600/30 bg-black/20 hover:border-purple-500/50'\n                    }`}
                  >
                    <div className=\"font-medium text-sm\">{label}</div>
                    <div className=\"text-xs text-gray-400 mt-1\">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spatial Distortion */}
            <div>
              <label className=\"block text-sm font-medium mb-2\">
                Spatial Distortion Intensity: {appearance.spatialDistortion}%
              </label>
              <div className=\"flex items-center space-x-4\">
                <span className=\"text-xs text-gray-400\">0%</span>
                <input
                  type=\"range\"
                  min=\"0\"
                  max=\"100\"
                  value={appearance.spatialDistortion}
                  onChange={(e) => onChange('spatialDistortion', parseInt(e.target.value))}
                  className=\"flex-1 slider\"
                />
                <span className=\"text-xs text-gray-400\">100%</span>
              </div>
              <div className=\"mt-2 h-2 bg-gray-700 rounded-full overflow-hidden\">
                <div 
                  className=\"h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300\"
                  style={{ width: `${appearance.spatialDistortion}%` }}
                />
              </div>
            </div>

            {/* Toggle Effects */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div className=\"flex items-center justify-between p-3 bg-black/20 rounded-lg border border-gray-600/30\">
                <div>
                  <div className=\"font-medium text-sm\">Temporal Trail</div>
                  <div className=\"text-xs text-gray-400\">Leaves time-based visual traces</div>
                </div>
                <button
                  onClick={() => onChange('temporalTrail', !appearance.temporalTrail)}
                  className={`w-12 h-6 rounded-full transition-all ${\n                    appearance.temporalTrail \n                      ? 'bg-purple-500' \n                      : 'bg-gray-600'\n                  }`}
                >
                  <div 
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${\n                      appearance.temporalTrail \n                        ? 'translate-x-7' \n                        : 'translate-x-1'\n                    }`}
                  />
                </button>
              </div>

              <div className=\"flex items-center justify-between p-3 bg-black/20 rounded-lg border border-gray-600/30\">
                <div>
                  <div className=\"font-medium text-sm\">Consciousness Glow</div>
                  <div className=\"text-xs text-gray-400\">Ethereal awareness indicator</div>
                </div>
                <button
                  onClick={() => onChange('consciousnessGlow', !appearance.consciousnessGlow)}
                  className={`w-12 h-6 rounded-full transition-all ${\n                    appearance.consciousnessGlow \n                      ? 'bg-purple-500' \n                      : 'bg-gray-600'\n                  }`}
                >
                  <div 
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${\n                      appearance.consciousnessGlow \n                        ? 'translate-x-7' \n                        : 'translate-x-1'\n                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Colors */}
        <div className=\"border-t border-gray-600/30 pt-4\">
          <div className=\"text-sm text-gray-400 mb-2\">Color Preview</div>
          <div className=\"flex items-center space-x-4\">
            <div className=\"flex items-center space-x-2\">
              <div 
                className=\"w-8 h-8 rounded-lg border border-gray-600\"
                style={{ backgroundColor: appearance.primaryColor }}
              />
              <span className=\"text-xs\">Primary</span>
            </div>
            <div className=\"flex items-center space-x-2\">
              <div 
                className=\"w-8 h-8 rounded-lg border border-gray-600\"
                style={{ backgroundColor: appearance.secondaryColor }}
              />
              <span className=\"text-xs\">Secondary</span>
            </div>
            <div className=\"flex items-center space-x-2\">
              <div 
                className=\"w-8 h-8 rounded-lg border border-gray-600\"
                style={{ backgroundColor: appearance.accentColor }}
              />
              <span className=\"text-xs\">Accent</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}