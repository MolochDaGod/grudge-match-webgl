'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Zap, User, Palette, Save, Upload, Download, Gamepad2 } from 'lucide-react';

import {
  Character4D,
  CharacterAttributes,
  CharacterAppearance,
  CHARACTER_CONSTRAINTS,
} from '@/types/Character';
import { CharacterService } from '@/services/CharacterService';
import AttributeControls from './AttributeControls';
import AppearanceControls from './AppearanceControls';
import CharacterPreview from './CharacterPreview';
import TokenBalance from './TokenBalance';
import CharacterList from './CharacterList';

const defaultAttributes: CharacterAttributes = {
  strength: 10,
  defense: 10,
  speed: 10,
  intelligence: 10,
  temporal: 10,
  spatial: 10,
  consciousness: 10,
  harmony: 10,
};

const defaultAppearance: CharacterAppearance = {
  bodyType: 'athletic',
  primaryColor: '#4A90E2',
  secondaryColor: '#7B68EE',
  accentColor: '#FFD700',
  dimensionalAura: 'stable',
  temporalTrail: false,
  spatialDistortion: 25,
  consciousnessGlow: true,
};

export default function CharacterBuilder() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'builder' | 'collection'>('builder');
  const [currentCharacter, setCurrentCharacter] = useState<Character4D | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [characterBackstory, setCharacterBackstory] = useState('');
  const [attributes, setAttributes] = useState<CharacterAttributes>(defaultAttributes);
  const [appearance, setAppearance] = useState<CharacterAppearance>(defaultAppearance);
  const [isSaving, setIsSaving] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);

  // Calculate derived values
  const totalAttributePoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const rarity = CharacterService.calculateRarity(attributes);
  const mintCost = CharacterService.calculateMintCost(attributes);

  // Handle attribute changes
  const handleAttributeChange = useCallback((attr: keyof CharacterAttributes, value: number) => {
    setAttributes(prev => ({ ...prev, [attr]: value }));
  }, []);

  // Handle appearance changes
  const handleAppearanceChange = useCallback((key: keyof CharacterAppearance, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  }, []);

  // Load character preset
  const loadPreset = useCallback((preset: any) => {
    setAttributes({ ...defaultAttributes, ...preset.attributes });
    setAppearance({ ...defaultAppearance, ...preset.appearance });
    setCharacterBackstory(preset.suggestedBackstory);
    setCharacterName(preset.name);
  }, []);

  // Save character
  const saveCharacter = useCallback(async () => {
    if (!characterName.trim()) {
      alert('Please enter a character name');
      return;
    }

    const validation = CharacterService.validateAttributes(attributes);
    if (!validation.valid) {
      alert('Invalid attributes: ' + validation.errors.join(', '));
      return;
    }

    setIsSaving(true);
    try {
      const character = CharacterService.createNewCharacter(
        characterName.trim(),
        attributes,
        appearance,
        characterBackstory
      );

      CharacterService.saveCharacter(character);
      setCurrentCharacter(character);
      alert('Character saved successfully!');
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Error saving character. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [characterName, attributes, appearance, characterBackstory]);

  // Load existing character
  const loadCharacter = useCallback((character: Character4D) => {
    setCurrentCharacter(character);
    setCharacterName(character.name);
    setAttributes(character.attributes);
    setAppearance(character.appearance);
    setCharacterBackstory(character.metadata.backstory);
    setActiveTab('builder');
  }, []);

  // Export character for game
  const exportCharacter = useCallback(() => {
    if (!currentCharacter) return;

    const gameData = CharacterService.exportCharacterForGame(currentCharacter);
    const blob = new Blob([gameData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name.toLowerCase().replace(/\s+/g, '_')}_character.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentCharacter]);

  return (
    <div className=\"min-h-screen text-white\">
      {/* Header */}
      <header className=\"bg-black/20 backdrop-blur-sm border-b border-purple-500/30 p-4\">
        <div className=\"max-w-7xl mx-auto flex items-center justify-between\">
          <div className=\"flex items-center space-x-4\">
            <h1 className=\"text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent\">
              Grudge Tower 4D
            </h1>
            <span className=\"text-sm opacity-70\">Character Builder</span>
          </div>

          <div className=\"flex items-center space-x-4\">
            {connected && <TokenBalance />}
            <WalletMultiButton className=\"!bg-purple-600 hover:!bg-purple-700\" />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className=\"bg-black/10 backdrop-blur-sm border-b border-purple-500/20\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"flex space-x-8\">
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-2 border-b-2 transition-colors ${\n                activeTab === 'builder'\n                  ? 'border-purple-400 text-purple-300'\n                  : 'border-transparent text-gray-400 hover:text-white'\n              }`}
            >
              <div className=\"flex items-center space-x-2\">
                <User className=\"w-4 h-4\" />
                <span>Character Builder</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`py-4 px-2 border-b-2 transition-colors ${\n                activeTab === 'collection'\n                  ? 'border-purple-400 text-purple-300'\n                  : 'border-transparent text-gray-400 hover:text-white'\n              }`}
            >
              <div className=\"flex items-center space-x-2\">
                <Gamepad2 className=\"w-4 h-4\" />
                <span>My Characters</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto p-6\">
        {activeTab === 'builder' ? (
          <div className=\"grid grid-cols-1 xl:grid-cols-3 gap-6\">\n            {/* Character Preview */}\n            <div className=\"xl:col-span-1\">\n              <motion.div\n                initial={{ opacity: 0, x: -20 }}\n                animate={{ opacity: 1, x: 0 }}\n                className=\"bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6\"\n              >\n                <h2 className=\"text-xl font-semibold mb-4 flex items-center space-x-2\">\n                  <User className=\"w-5 h-5\" />\n                  <span>Character Preview</span>\n                </h2>\n                \n                <CharacterPreview \n                  attributes={attributes}\n                  appearance={appearance}\n                  name={characterName || 'Unnamed Character'}\n                  rarity={rarity}\n                />\n\n                {/* Character Info */}\n                <div className=\"mt-6 space-y-4\">\n                  <div>\n                    <label className=\"block text-sm font-medium mb-2\">Character Name</label>\n                    <input\n                      type=\"text\"\n                      value={characterName}\n                      onChange={(e) => setCharacterName(e.target.value)}\n                      className=\"w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md focus:border-purple-400 focus:outline-none\"\n                      placeholder=\"Enter character name\"\n                      maxLength={CHARACTER_CONSTRAINTS.NAME_MAX_LENGTH}\n                    />\n                  </div>\n\n                  <div>\n                    <label className=\"block text-sm font-medium mb-2\">Backstory</label>\n                    <textarea\n                      value={characterBackstory}\n                      onChange={(e) => setCharacterBackstory(e.target.value)}\n                      className=\"w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md focus:border-purple-400 focus:outline-none resize-none\"\n                      placeholder=\"Tell your character's story...\"\n                      rows={4}\n                      maxLength={CHARACTER_CONSTRAINTS.BACKSTORY_MAX_LENGTH}\n                    />\n                  </div>\n\n                  {/* Stats Summary */}\n                  <div className=\"bg-black/30 rounded-md p-4\">\n                    <div className=\"text-sm space-y-2\">\n                      <div className=\"flex justify-between\">\n                        <span>Total Points:</span>\n                        <span className={totalAttributePoints > 160 ? 'text-red-400' : 'text-green-400'}>\n                          {totalAttributePoints} / 160\n                        </span>\n                      </div>\n                      <div className=\"flex justify-between\">\n                        <span>Rarity:</span>\n                        <span className={`capitalize font-semibold ${\n                          rarity === 'mythic' ? 'text-purple-400' :\n                          rarity === 'legendary' ? 'text-yellow-400' :\n                          rarity === 'epic' ? 'text-purple-300' :\n                          rarity === 'rare' ? 'text-blue-400' :\n                          rarity === 'uncommon' ? 'text-green-400' : 'text-gray-400'\n                        }`}>\n                          {rarity}\n                        </span>\n                      </div>\n                      <div className=\"flex justify-between\">\n                        <span>Mint Cost:</span>\n                        <span className=\"text-yellow-400\">{mintCost} GBUX</span>\n                      </div>\n                    </div>\n                  </div>\n\n                  {/* Action Buttons */}\n                  <div className=\"flex space-x-2\">\n                    <button\n                      onClick={saveCharacter}\n                      disabled={isSaving || !characterName.trim()}\n                      className=\"flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors\"\n                    >\n                      <Save className=\"w-4 h-4\" />\n                      <span>{isSaving ? 'Saving...' : 'Save Character'}</span>\n                    </button>\n                    \n                    {currentCharacter && (\n                      <button\n                        onClick={exportCharacter}\n                        className=\"flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors\"\n                      >\n                        <Download className=\"w-4 h-4\" />\n                        <span>Export</span>\n                      </button>\n                    )}\n                  </div>\n\n                  {connected && currentCharacter && (\n                    <button\n                      onClick={() => setShowMintModal(true)}\n                      className=\"w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors\"\n                    >\n                      <Zap className=\"w-4 h-4\" />\n                      <span>Mint as NFT ({mintCost} GBUX)</span>\n                    </button>\n                  )}\n                </div>\n              </motion.div>\n            </div>\n\n            {/* Controls */}\n            <div className=\"xl:col-span-2 space-y-6\">\n              <AttributeControls\n                attributes={attributes}\n                onChange={handleAttributeChange}\n                totalPoints={totalAttributePoints}\n                onLoadPreset={loadPreset}\n              />\n              \n              <AppearanceControls\n                appearance={appearance}\n                onChange={handleAppearanceChange}\n              />\n            </div>\n          </div>\n        ) : (\n          <CharacterList\n            onLoadCharacter={loadCharacter}\n            onExportCharacter={(char) => {\n              setCurrentCharacter(char);\n              exportCharacter();\n            }}\n          />\n        )}\n      </div>\n    </div>\n  );\n}