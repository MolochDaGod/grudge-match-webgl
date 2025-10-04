'use client';

import React, { useState, useEffect } from 'react';
import { AudioService, AudioConfig } from '../services/AudioService';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const [config, setConfig] = useState<AudioConfig>({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    muted: false
  });
  
  const audioService = AudioService.getInstance();

  useEffect(() => {
    if (isOpen) {
      setConfig(audioService.getConfig());
    }
  }, [isOpen]);

  const handleMasterVolumeChange = (value: number) => {
    audioService.setMasterVolume(value);
    setConfig(audioService.getConfig());
  };

  const handleSfxVolumeChange = (value: number) => {
    audioService.setSfxVolume(value);
    setConfig(audioService.getConfig());
  };

  const handleMusicVolumeChange = (value: number) => {
    audioService.setMusicVolume(value);
    setConfig(audioService.getConfig());
  };

  const handleToggleMute = () => {
    audioService.toggleMute();
    setConfig(audioService.getConfig());
  };

  const handleTestSound = () => {
    audioService.playUIClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Audio Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">
              {config.muted ? 'Unmute Audio' : 'Mute Audio'}
            </label>
            <button
              onClick={handleToggleMute}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.muted ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.muted ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>

          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Master Volume</label>
              <span className="text-gray-300">
                {Math.round(config.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              disabled={config.muted}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Sound Effects</label>
              <span className="text-gray-300">
                {Math.round(config.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.sfxVolume}
              onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
              disabled={config.muted}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-end">
              <button
                onClick={handleTestSound}
                disabled={config.muted}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test
              </button>
            </div>
          </div>

          {/* Background Music Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Background Music</label>
              <span className="text-gray-300">
                {Math.round(config.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.musicVolume}
              onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
              disabled={config.muted}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
          }

          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
          }

          .slider:disabled::-webkit-slider-thumb {
            background: #6b7280;
            cursor: not-allowed;
          }

          .slider:disabled::-moz-range-thumb {
            background: #6b7280;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
}