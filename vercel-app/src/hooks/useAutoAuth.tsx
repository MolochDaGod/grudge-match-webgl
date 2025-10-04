/**
 * Auto-Authentication Hook
 * Automatically grants permissions to anyone who connects a wallet or plays as guest
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface UserPermissions {
  canPlay: boolean;
  canCreateCharacters: boolean;
  canPlayTowerDefense: boolean;
  canMintNFTs: boolean;
  canTrade: boolean;
  canUseBlockchain: boolean;
  isAuthenticated: boolean;
  userType: 'guest' | 'wallet' | 'premium';
}

const DEFAULT_GUEST_PERMISSIONS: UserPermissions = {
  canPlay: true,
  canCreateCharacters: true,
  canPlayTowerDefense: true,
  canMintNFTs: false, // Requires wallet connection
  canTrade: false, // Requires wallet connection
  canUseBlockchain: false, // Requires wallet connection
  isAuthenticated: true,
  userType: 'guest'
};

const DEFAULT_WALLET_PERMISSIONS: UserPermissions = {
  canPlay: true,
  canCreateCharacters: true,
  canPlayTowerDefense: true,
  canMintNFTs: true,
  canTrade: true,
  canUseBlockchain: true,
  isAuthenticated: true,
  userType: 'wallet'
};

export function useAutoAuth() {
  const { connected, publicKey, wallet } = useWallet();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_GUEST_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(true);

  // Auto-grant permissions based on connection status
  useEffect(() => {
    if (connected && publicKey) {
      // Wallet connected - grant full permissions
      setPermissions({
        ...DEFAULT_WALLET_PERMISSIONS,
        userType: wallet?.adapter.name ? 'premium' : 'wallet'
      });
      setGuestMode(false);
    } else {
      // No wallet connected - grant guest permissions
      setPermissions(DEFAULT_GUEST_PERMISSIONS);
      setGuestMode(true);
    }
  }, [connected, publicKey, wallet]);

  /**
   * Enable guest mode - allows playing without wallet
   */
  const enableGuestMode = () => {
    setPermissions(DEFAULT_GUEST_PERMISSIONS);
    setGuestMode(true);
  };

  /**
   * Quick connect - attempt to connect wallet but don't require it
   */
  const quickConnect = async () => {
    setIsLoading(true);
    try {
      // If wallet is available, try to connect
      if (wallet?.adapter) {
        await wallet.adapter.connect();
      }
    } catch (error) {
      console.log('Wallet connection failed, continuing in guest mode');
      enableGuestMode();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user can perform action (always returns true for auto-permissions)
   */
  const canPerformAction = (action: keyof Omit<UserPermissions, 'isAuthenticated' | 'userType'>): boolean => {
    return permissions[action];
  };

  /**
   * Get user status display
   */
  const getUserStatus = (): string => {
    if (connected && publicKey) {
      return `Connected: ${publicKey.toBase58().slice(0, 8)}...`;
    }
    return 'Playing as Guest';
  };

  /**
   * Get upgrade suggestions
   */
  const getUpgradeSuggestion = (): string | null => {
    if (!connected) {
      return 'Connect wallet to mint NFTs and trade characters';
    }
    return null;
  };

  return {
    // Permission status
    permissions,
    isAuthenticated: permissions.isAuthenticated,
    isGuest: guestMode,
    isConnected: connected,
    isLoading,
    
    // User info
    user: { id: `guest-${Date.now()}` },
    publicKey,
    wallet,
    userStatus: getUserStatus(),
    upgradeSuggestion: getUpgradeSuggestion(),
    
    // Actions
    enableGuestMode,
    quickConnect,
    canPerformAction,
    
    // Convenience permission checks
    canPlay: permissions.canPlay,
    canCreateCharacters: permissions.canCreateCharacters,
    canPlayTowerDefense: permissions.canPlayTowerDefense,
    canMintNFTs: permissions.canMintNFTs,
    canTrade: permissions.canTrade,
    canUseBlockchain: permissions.canUseBlockchain,
  };
}

/**
 * Permission Gate Component - allows everyone through with optional upgrade prompts
 */
export function PermissionGate({ 
  children, 
  requiredPermission, 
  showUpgradePrompt = true 
}: { 
  children: React.ReactNode;
  requiredPermission?: keyof Omit<UserPermissions, 'isAuthenticated' | 'userType'>;
  showUpgradePrompt?: boolean;
}) {
  const auth = useAutoAuth();
  
  // If no specific permission required, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }
  
  // Check permission
  const hasPermission = auth.canPerformAction(requiredPermission);
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  // Show upgrade prompt for restricted features
  if (showUpgradePrompt && auth.upgradeSuggestion) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔒</div>
          <h3 className="text-xl font-bold text-white">Premium Feature</h3>
          <p className="text-purple-200">{auth.upgradeSuggestion}</p>
          <button 
            onClick={auth.quickConnect}
            disabled={auth.isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {auth.isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <button 
            onClick={auth.enableGuestMode}
            className="block mx-auto text-purple-300 hover:text-white text-sm underline"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}