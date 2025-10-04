'use client';

import CharacterBuilder from '@/features/character-builder/components/CharacterBuilder';
import TowerWarsGame from '@/features/tower-defense/components/TowerWarsGame';
import PvETowerDefense from '@/features/tower-defense/components/PvETowerDefense';
import { AnalyticsService } from '@/shared/utils/analytics';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'character' | 'tower-wars' | 'tower-defense'>('character');
  const auth = useAutoAuth();

  // Track initial page load
  useEffect(() => {
    AnalyticsService.trackViewChange('character');
  }, []);

  const handleViewChange = (view: 'character' | 'tower-wars' | 'tower-defense') => {
    setCurrentView(view);
    AnalyticsService.trackViewChange(view);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* User Status Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Grudge Match WebGL
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              {auth.userStatus} • {auth.isGuest ? '✅ Full Game Access' : '🔗 Premium Features Unlocked'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {auth.isGuest && (
              <div className="text-center">
                <div className="text-green-400 font-semibold text-sm">🎮 Playing as Guest</div>
                <div className="text-purple-300 text-xs">No wallet required!</div>
              </div>
            )}
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600" />
          </div>
        </div>
        
        {/* Welcome Message for New Users */}
        {auth.isGuest && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎉</div>
              <div>
                <h3 className="text-green-300 font-semibold">Welcome! You can play immediately!</h3>
                <p className="text-green-200 text-sm">
                  Create characters and play tower defense without connecting a wallet. 
                  Connect later to mint NFTs and trade characters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-black/20 rounded-lg p-2">
            <button
              onClick={() => handleViewChange('character')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                currentView === 'character'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🎭 Character Builder
            </button>
            <button
              onClick={() => handleViewChange('tower-defense')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                currentView === 'tower-defense'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🏰 PvE Tower Defense
            </button>
            <button
              onClick={() => handleViewChange('tower-wars')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                currentView === 'tower-wars'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚔️ Tower Wars (PvP)
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'character' && <CharacterBuilder />}
        {currentView === 'tower-defense' && <PvETowerDefense />}
        {currentView === 'tower-wars' && <TowerWarsGame />}
      </div>
    </main>
  );
}
