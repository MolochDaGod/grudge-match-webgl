'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Zap, User, Save, Download, Gamepad2, Volume2, Gift } from 'lucide-react';
import { useAutoAuth, PermissionGate } from '@/hooks/useAutoAuth';

import {
  Character4D,
  CharacterAttributes,
  CharacterAppearance,
  CHARACTER_CONSTRAINTS,
} from '@/types/Character';
import { Tower } from '@/types/TowerDefense';
import { CharacterService } from '@/features/character-builder/services/CharacterService';
import { NFTService } from '@/features/marketplace/services/NFTService';
import { TowerConversionService } from '@/features/tower-defense/services/TowerConversionService';
import { AudioService } from '@/shared/services/AudioService';
import { AnalyticsService } from '@/shared/utils/analytics';
import { useWalletAnalytics } from '@/shared/hooks/useWalletAnalytics';
import AttributeControls from './AttributeControls';
import AppearanceControls from './AppearanceControls';
import CharacterPreview from './CharacterPreview';
import TokenBalance from '@/shared/components/TokenBalance';
import CharacterList from './CharacterList';
import TowerDefenseGame from '@/features/tower-defense/components/TowerDefenseGame';
import AudioSettings from '@/shared/components/AudioSettings';

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
  useWalletAnalytics(); // Track wallet connections
  const { connected, publicKey } = useWallet();
  const auth = useAutoAuth();
  const [activeTab, setActiveTab] = useState<'builder' | 'collection' | 'game'>('builder');
  const [currentCharacter, setCurrentCharacter] = useState<Character4D | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [characterBackstory, setCharacterBackstory] = useState('');
  const [attributes, setAttributes] = useState<CharacterAttributes>(defaultAttributes);
  const [appearance, setAppearance] = useState<CharacterAppearance>(defaultAppearance);
  const [isSaving, setIsSaving] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [playerTowers, setPlayerTowers] = useState<Tower[]>([]);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
  // Initialize audio service
  useEffect(() => {
    const initAudio = async () => {
      const audioService = AudioService.getInstance();
      await audioService.initialize();
      // Start background music
      audioService.playBackgroundMusic();
    };
    initAudio();
  }, []);

  // Calculate derived values
  const totalAttributePoints = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const rarity = CharacterService.calculateRarity(attributes);
  const mintCost = CharacterService.calculateMintCost(attributes);

  // Handle attribute changes
  const handleAttributeChange = useCallback((attr: keyof CharacterAttributes, value: number) => {
    setAttributes(prev => ({ ...prev, [attr]: value }));
    // Play UI click sound
    const audioService = AudioService.getInstance();
    audioService.playUIClick();
  }, []);

  // Handle appearance changes
  const handleAppearanceChange = useCallback((key: keyof CharacterAppearance, value: string | number | boolean) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  }, []);

  // Load character preset
  const loadPreset = useCallback((preset: { name: string; attributes: Partial<CharacterAttributes>; appearance: Partial<CharacterAppearance>; suggestedBackstory: string }) => {
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
      
      // Track character creation analytics
      AnalyticsService.trackCharacterCreated({
        rarity,
        totalAttributes: totalAttributePoints,
        mintCost,
      });
      AnalyticsService.trackCharacterSaved(character.id, character.name);
      
      // Play success sound
      const audioService = AudioService.getInstance();
      audioService.playUIClick();
      
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

    // Track export analytics
    AnalyticsService.trackCharacterExported('json');

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

  // Convert character to tower for game
  const exportCharacterAsTower = useCallback(() => {
    if (!currentCharacter) {
      alert('Please create and save a character first');
      return;
    }

    const validation = TowerConversionService.validateCharacterForTower(currentCharacter);
    if (!validation.valid) {
      alert('Character validation failed: ' + validation.errors.join(', '));
      return;
    }

    const tower = TowerConversionService.convertCharacterToTower(currentCharacter);
    setPlayerTowers(prev => [...prev, tower]);
    setActiveTab('game');
    
    // Track tower conversion analytics
    AnalyticsService.trackCharacterExported('tower');
    AnalyticsService.trackFeatureUsed('character_to_tower_conversion', {
      character_id: currentCharacter.id,
      tower_type: tower.type,
    });
    
    alert(`${currentCharacter.name} has been converted to a ${tower.type} tower!`);
  }, [currentCharacter]);

  // Handle tower creation in game (for NFT minting)
  const handleTowerCreate = useCallback(async (tower: Tower) => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet to mint tower NFTs');
      return;
    }

    // Here we would integrate NFT minting logic
    console.log('Minting tower NFT:', tower);
    alert(`Tower ${tower.name} deployed! NFT minting feature coming soon.`);
  }, [connected, publicKey]);

  // Get free GBUX from faucet
  const claimGbuxFromFaucet = useCallback(async () => {
    setIsProcessingPayment(true);
    try {
      const nftService = new NFTService();
      await nftService.initialize();
      
      const txHash = await nftService.claimGBUXFromFaucet();
      
      // Play token purchased sound
      const audioService = AudioService.getInstance();
      audioService.playTokenPurchased();
      
      alert(`Successfully claimed 100 GBUX from faucet!\nTransaction: ${txHash}`);
      setShowPurchaseModal(false);
    } catch (error) {
      console.error('GBUX faucet error:', error);
      alert('Failed to claim GBUX from faucet. You may have already claimed or need to connect your wallet.');
    } finally {
      setIsProcessingPayment(false);
    }
  }, []);

  // Create character NFT with real blockchain minting
  const createCharacterWithPayment = useCallback(async () => {
    if (!currentCharacter || !characterName.trim()) {
      alert('Please create and save a character first');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const nftService = new NFTService();
      await nftService.initialize();
      
      // Calculate and validate mint cost
      const calculatedCost = await nftService.calculateCharacterMintCost(currentCharacter);
      
      // Mint the character NFT
      const result = await nftService.mintCharacter(
        currentCharacter,
        characterName,
        '' // TODO: Upload metadata to IPFS
      );
      
      // Update character with NFT data
      const updatedCharacter = {
        ...currentCharacter,
        metadata: {
          ...currentCharacter.metadata,
          mintTxHash: result.txHash,
          tokenId: result.tokenId
        }
      };
      
      CharacterService.saveCharacter(updatedCharacter);
      setCurrentCharacter(updatedCharacter);
      
      // Play character minted sound
      const audioService = AudioService.getInstance();
      audioService.playCharacterMinted();
      
      alert(`Character NFT minted successfully!\nToken ID: ${result.tokenId}\nTransaction: ${result.txHash}`);
    } catch (error) {
      console.error('Character minting error:', error);
      alert('Failed to mint character NFT. Make sure you have enough GBUX and try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  }, [currentCharacter, characterName]);

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Grudge Tower 4D
            </h1>
            <span className="text-sm opacity-70">Character Builder</span>
          </div>

          <div className="flex items-center space-x-4">
            {auth.isConnected && <TokenBalance />}
            <button
              onClick={() => setShowAudioSettings(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Audio Settings"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            
            <div className="text-sm text-right">
              <div className={auth.isGuest ? 'text-green-400' : 'text-purple-400'}>
                {auth.userStatus}
              </div>
              {auth.isGuest && (
                <div className="text-purple-300 text-xs">Full access without wallet!</div>
              )}
            </div>
            
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'builder'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Character Builder</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'collection'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4" />
                <span>My Characters</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'game'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Tower Defense</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'builder' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Character Preview */}
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Character Preview</span>
                </h2>
                
            <CharacterPreview
              attributes={attributes}
              appearance={appearance}
              name={characterName || 'Unnamed Character'}
              rarity={rarity}
              character={currentCharacter}
            />

                {/* Character Info */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Character Name</label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md focus:border-purple-400 focus:outline-none"
                      placeholder="Enter character name"
                      maxLength={CHARACTER_CONSTRAINTS.NAME_MAX_LENGTH}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Backstory</label>
                    <textarea
                      value={characterBackstory}
                      onChange={(e) => setCharacterBackstory(e.target.value)}
                      className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md focus:border-purple-400 focus:outline-none resize-none"
                      placeholder="Tell your character's story..."
                      rows={4}
                      maxLength={CHARACTER_CONSTRAINTS.BACKSTORY_MAX_LENGTH}
                    />
                  </div>

                  {/* Stats Summary */}
                  <div className="bg-black/30 rounded-md p-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Total Points:</span>
                        <span className={totalAttributePoints > 160 ? 'text-red-400' : 'text-green-400'}>
                          {totalAttributePoints} / 160
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rarity:</span>
                        <span className={`capitalize font-semibold ${
                          rarity === 'mythic' ? 'text-purple-400' :
                          rarity === 'legendary' ? 'text-yellow-400' :
                          rarity === 'epic' ? 'text-purple-300' :
                          rarity === 'rare' ? 'text-blue-400' :
                          rarity === 'uncommon' ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {rarity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mint Cost:</span>
                        <span className="text-yellow-400">{mintCost} GBUX</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={saveCharacter}
                      disabled={isSaving || !characterName.trim()}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Character'}</span>
                    </button>
                    
                    {currentCharacter && (
                      <>
                        <button
                          onClick={exportCharacter}
                          className="flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={exportCharacterAsTower}
                          className="flex items-center justify-center space-x-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                        >
                          <Zap className="w-4 h-4" />
                          <span>To Tower</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* NFT Minting Section - Requires Wallet Connection */}
                  <PermissionGate requiredPermission="canMintNFTs">
                    {currentCharacter && (
                      <div className="space-y-2">
                        <button
                          onClick={createCharacterWithPayment}
                          disabled={isProcessingPayment}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          <Gift className="w-4 h-4" />
                          <span>
                            {isProcessingPayment ? 'Minting NFT...' : 'Mint Character NFT'}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => setShowPurchaseModal(true)}
                          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-sm"
                        >
                          <span>🚰 Get Free GBUX</span>
                        </button>
                      </div>
                    )}
                  </PermissionGate>
                  
                  {/* Guest Mode Info */}
                  {auth.isGuest && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-md p-3 text-center">
                      <div className="text-blue-300 text-sm">
                        🎮 <strong>Playing as Guest</strong><br/>
                        Save & export characters freely!<br/>
                        <span className="text-blue-200 text-xs">Connect wallet to mint NFTs</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="xl:col-span-2 space-y-6">
              <AttributeControls
                attributes={attributes}
                onChange={handleAttributeChange}
                totalPoints={totalAttributePoints}
                onLoadPreset={loadPreset}
              />
              
              <AppearanceControls
                appearance={appearance}
                onChange={handleAppearanceChange}
              />
            </div>
          </div>
        ) : activeTab === 'collection' ? (
          <CharacterList
            onLoadCharacter={loadCharacter}
            onExportCharacter={(char) => {
              setCurrentCharacter(char);
              exportCharacter();
            }}
          />
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>4D Tower Defense</span>
              </h2>
              
              <div className="text-sm mb-4">
                <p className="text-gray-300 mb-2">
                  Deploy your characters as towers in this 4D tower defense game. Characters with higher 4D attributes 
                  (temporal, spatial, consciousness, harmony) create more powerful towers with unique abilities.  
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-black/30 p-3 rounded-md">
                    <h3 className="font-semibold mb-1 text-blue-400">Temporal Towers</h3>
                    <p>Slow enemies by manipulating time. Best with high temporal stats.</p>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <h3 className="font-semibold mb-1 text-purple-400">Spatial Towers</h3>
                    <p>Attack through walls and dimensions. Boost with spatial stats.</p>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <h3 className="font-semibold mb-1 text-green-400">Consciousness Towers</h3>
                    <p>Buff nearby towers and debuff enemies. Powered by consciousness.</p>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <h3 className="font-semibold mb-1 text-yellow-400">Harmony Towers</h3>
                    <p>Chain attacks to multiple enemies. Enhance with harmony stats.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* The actual tower defense game */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/30 overflow-hidden">
              <TowerDefenseGame 
                playerTowers={playerTowers} 
                onTowerCreate={handleTowerCreate} 
              />
            </div>
          </div>
        )}
      </div>

      {/* GBUX Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <span>🚰</span>
              <span>Get Free GBUX Tokens</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-black/30 rounded-md p-4">
                <div className="text-center space-y-3">
                  <div className="text-4xl">🚰</div>
                  <h4 className="text-lg font-semibold text-green-400">GBUX Faucet</h4>
                  <p className="text-sm opacity-80">
                    Get 100 free GBUX tokens to start minting characters and equipment!
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-600/20 border border-yellow-600/40 rounded-md p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Free Amount:</span>
                    <span className="font-semibold">100 GBUX</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limit:</span>
                    <span>Once per wallet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="text-green-400">FREE!</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>• GBUX tokens are used to mint character NFTs and equipment</p>
                <p>• Character minting costs vary based on attributes (50-500+ GBUX)</p>
                <p>• Equipment items cost 20-100+ GBUX depending on rarity</p>
                <p>• $1 admin fee (in GBUX) goes to treasury per mint</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={isProcessingPayment}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={claimGbuxFromFaucet}
                disabled={isProcessingPayment}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isProcessingPayment ? 'Claiming...' : 'Claim Free GBUX'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Audio Settings Modal */}
      <AudioSettings 
        isOpen={showAudioSettings} 
        onClose={() => setShowAudioSettings(false)} 
      />
    </div>
  );
}
